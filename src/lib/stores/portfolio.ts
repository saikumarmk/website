import { writable } from 'svelte/store';
import { experience as exp_data } from '$lib/config/portfolio';
import { projects as project_data } from '$lib/config/portfolio';

export const projects = writable(project_data);
export const experience = writable(exp_data); 