module.exports = function (broccoli) {
    var pickFiles = require('broccoli-static-compiler');
    var traceur = require('broccoli-traceur');
    // var filterTemplates = require('broccoli-template');

    var js5 = broccoli.makeTree('src/js5');
    js5 = pickFiles(js5, {
        srcDir: '/',
        destDir: 'js'
    });

    var js = broccoli.makeTree('src/js');
    js = pickFiles(js, {
        srcDir: '/',
        destDir: 'js'
    });
    js = traceur(js, {
        modules: 'amd'
    });

    var vendor = broccoli.makeTree('src/vendor');
    vendor = pickFiles(vendor, {
        srcDir: '/',
        destDir: 'vendor'
    });

    var templates = broccoli.makeTree('src/templates');
    templates = pickFiles(templates, {
        srcDir: '/',
        destDir: '' 
    });

    var assets = broccoli.makeTree('src/assets');
    assets = pickFiles(assets, {
        srcDir: '/',
        destDir: 'assets'
    });

    return [js5, js, vendor, templates, assets];
};
