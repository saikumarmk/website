module.exports = {
    hooks: {
        readPackage(pkg) {
            if (pkg.name === 'sharp') {
                pkg.scripts = {
                    install: 'node install/libvips && node install/dll-copy',
                    ...pkg.scripts
                }
            }
            return pkg
        }
    }
}