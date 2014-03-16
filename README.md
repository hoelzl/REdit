REdit
=====

*REdit* is a simple editor for creating instances of the ASCENS robot rescue
scenario that can be used to test machine learning techniques with Poem or the
Academia system.

It uses *bower* and *node* to organize the run-time and development-time
dependencies, and *broccoli* as build system.  To build and run a local
instance, clone the repository and from the top level perform

    $ npm install
    $ bower install
    $ broccoli serve

This will install all dependencies and start a server on port 4200 on localhost.


