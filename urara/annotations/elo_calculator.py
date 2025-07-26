"""
## Elo Calculator for the Pokémon Red Tournament

All we'll need is `sklearn.linear_model.LogisticRegression`, and our data from the battle.
"""

import pickle
import numpy as np
from sklearn import linear_model
from typing import List, Dict
from dataclasses import dataclass, field
from pykmn.engine.common import ResultType
from models.pokemon import deserialize_trainerclasses, Pokemon


@dataclass
class Trainer:
    """
    Data structure for a Pokémon Trainer and their LR Elo.

    name: Trainer's name
    location: In-game location of the trainer
    pokemon: List of their Pokémon (could be used for features)
    lr_elo: Logistic Regression Elo rating (starts at 1500)
    """

    name: str
    location: str
    pokemon: List[Pokemon] = field(default_factory=list)
    lr_elo: float = 1500.0


def load_battle_results(filename: str) -> List[Dict]:
    """
    Loads battle result data from a pickle file.
    Each battle is a dictionary with:
    - 'player1': "name-location" of player 1
    - 'player2': "name-location" of player 2
    - 'outcome': ResultType
    """
    with open(filename, "rb") as f:
        return pickle.load(f)


def build_trainer_lookup(trainers: List[Trainer]) -> Dict[str, int]:
    """
    Builds a lookup table mapping trainer identifier strings
    of the form "name-location" to their index in the list.
    """
    return {
        f"{trainer.name}-{trainer.location}": idx
        for idx, trainer in enumerate(trainers)
    }


def generate_lr_elo(battle_results: List[Dict], trainers: List[Trainer]):
    """
    Solves the logistic regression problem to find trainer Elo scores.

    Each battle provides data $\mathcal{D} = (X, Y)$:
    - Input $x$: $x\in \mathbb{R}^N$ where $x_k= 1$ for player 1 (with index k), $x_j=-1$ for player 2 (with index j)
    - Label $y$: $y\in \{0, 1\}$ with $y=1$ if player 1 wins, $y=0$ if player 2 wins


    For ties:
    - We add both $(x,1)$ and $(x,0)$ to our dataset.
    """
    # Number of trainers in generation 1 (includes unused trainers such as Professor Oak)
    N = len(trainers)

    # Build a fast lookup from trainer ID to index
    trainer_lookup = build_trainer_lookup(trainers)

    # Design matrix $X$: stores all match vectors
    X = []

    # Outcome vector $Y$: stores match outcomes
    Y = []

    # Iterate over all recorded battles
    for battle in battle_results:
        try:
            # Resolve trainer indices from IDs
            t1_id = battle["player1"]
            t2_id = battle["player2"]
            t1_idx = trainer_lookup[t1_id]
            t2_idx = trainer_lookup[t2_id]
            outcome = battle["outcome"]

            # Create feature vector: +1 for player 1, -1 for player 2
            v = np.zeros(N)
            v[t1_idx] = 1
            v[t2_idx] = -1

            # Add $x$ to $X$
            X.append(v)

            # Determine outcome label
            if outcome == ResultType.PLAYER_1_WIN:
                Y.append(1)
            elif outcome == ResultType.PLAYER_2_WIN:
                Y.append(0)
            # What are the conditions for a tie? Well, in Pokemon, we consider a tie a battle that has gone on forever.
            # Stall battles are usually battles that take too long, as we track PP usage so battles don't go forever, though there
            # are some trainer setups (namely Lorelei's Dewgong) that can stall forever. See [this video by Pikasprey](https://www.youtube.com/watch?v=CClsivwN8aw) for
            # more information on that.
            elif outcome == ResultType.TIE:
                Y.append(1)
                Y.append(0)
                X.append(v)
        except KeyError:
            # If trainer not found, skip and warn
            print(f"Trainer not found in lookup: {battle}")
            continue

    # Fit logistic regression to the match data
    clf = linear_model.LogisticRegression()
    clf.fit(X, Y)

    # Extract rankings $\theta$ and map to $\text{ELO} = 173 \cdot \theta + 1500$
    elo_scores = list(clf.coef_[0] * 173 + 1500)

    # Return Elo scores and intercept (for inspection)
    return elo_scores, clf.intercept_[0]


def main():
    """
    Pipeline:
    - Load trainer data
    - Load battle results
    - Fit LR Elo
    - Assign scores to trainers
    - Print sorted leaderboard
    """
    # Load all trainers grouped by class
    trainers = deserialize_trainerclasses("data/trainerclasses.pkl")

    # Flatten to a single list of trainers
    trainers_flat = [
        trainer for trainer_class in trainers for trainer in trainer_class.trainers
    ]

    # Load all recorded battle results
    battle_results = load_battle_results("battle_results.pkl")

    # Compute logistic regression-based Elo scores
    regression_elo, _ = generate_lr_elo(battle_results, trainers_flat)

    # Assign computed Elo back to trainer objects
    for i, trainer in enumerate(trainers_flat):
        trainer.lr_elo = regression_elo[i]

    # Sort trainers by Elo for leaderboard
    trainers_flat.sort(key=lambda t: t.lr_elo)

    # Print leaderboard
    for trainer in trainers_flat:
        print(
            f"Trainer: {trainer.name} - {trainer.location}, LR Elo: {trainer.lr_elo:.2f}"
        )


if __name__ == "__main__":
    main()
