var pickFiles = require('broccoli-static-compiler');
var traceur = require('broccoli-traceur');
var mergeTrees = require('broccoli-merge-trees');

var js5 = 'src/js5';
js5 = pickFiles(js5, {
    srcDir: '/',
    destDir: 'js'
});

var js = 'src/js';
js = pickFiles(js, {
    srcDir: '/',
    destDir: 'js'
});
js = traceur(js, {
    modules: 'amd'
});

var vendor = 'src/vendor';
vendor = pickFiles(vendor, {
    srcDir: '/',
    destDir: 'vendor'
});

var templates = 'src/templates';
templates = pickFiles(templates, {
    srcDir: '/',
    destDir: '' 
});

var assets = 'src/assets';
assets = pickFiles(assets, {
    srcDir: '/',
    destDir: 'assets'
});

module.exports = mergeTrees([js5, js, vendor, templates, assets]);
