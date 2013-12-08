// Generated on 2013-08-05 using generator-webapp 0.2.7
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        src: 'src',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            compass: {
                files: ['<%= yeoman.src %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= yeoman.src %>/styles/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            js: {
                files: [
                    '<%= yeoman.src %>/scripts/{,*/}*.js',
                    '.tmp/templates/{,*/}*.js'
                ],
                tasks: ['concat']
            },
            templates: {
                files: ['<%= yeoman.src %>/templates/{,*/}*.jst'],
                tasks: ['dot']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'examples/index.html',
                    '.tmp/styles/{,*/}*.css',
                    '.tmp/scripts/{,*/}*.js'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0'// 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.src),
                            mountFolder(connect, 'examples')
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test'),
                            mountFolder(connect, yeomanConfig.src)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.src %>/scripts/{,*/}*.js',
                '!<%= yeoman.src %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    log: true,
                    reporter: 'Spec',
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.src %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.src %>/images',
                javascriptsDir: '<%= yeoman.src %>/scripts',
                fontsDir: '<%= yeoman.src %>/styles/fonts',
                importPath: '<%= yeoman.src %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        dot: {
            all: {
                options: {
                    root: __dirname + '/src'
                },
                files: {
                    '.tmp/templates/dialog.js': '<%= yeoman.src %>/templates/dialog.jst'
                }
            }
        },
        concat: {
            vanilla: {
                src: [
                    '<%= yeoman.src %>/scripts/wrap/intro.js',
                    '<%= yeoman.src %>/scripts/akno.js',
                    '.tmp/templates/dialog.js',
                    '<%= yeoman.src %>/scripts/wrap/outro.js'

                ],
                dest: '.tmp/scripts/akno.js'
            },
            jquery: {
                src: [
                    '<%= yeoman.src %>/scripts/wrap/jquery-intro.js',
                    '<%= yeoman.src %>/scripts/akno.js',
                    '.tmp/templates/dialog.js',
                    '<%= yeoman.src %>/scripts/wrap/jquery-outro.js'
                ],
                dest: '.tmp/scripts/akno.jquery.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/akno.min.js':        '.tmp/scripts/akno.js',
                    '<%= yeoman.dist %>/scripts/akno.jquery.min.js': '.tmp/scripts/akno.jquery.js'
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/akno.min.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.src %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/akno.js':        '.tmp/scripts/akno.js',
                    '<%= yeoman.dist %>/scripts/akno.jquery.js': '.tmp/scripts/akno.jquery.js',
                    '<%= yeoman.dist %>/styles/akno.css':        '.tmp/styles/akno.css'
                }
            }
        },
        concurrent: {
            server: [
                'compass',
                'concat:vanilla'
            ],
            test: [
                'compass',
                'concat:jquery'
            ],
            dist: [
                'compass',
                'concat:vanilla'
            ]
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        if (target === 'test') {
            return grunt.task.run([
                'clean:server',
                'dot',
                'concurrent:test',
                'autoprefixer',
                'connect:test:keepalive'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'dot',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'dot',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'dot',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'copy:dist',
        'cssmin',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
