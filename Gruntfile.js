/**
 * Minimize del frontend
 * 1) connect
 * 2) open
 * 3) sass
 * 4) copy
 * 5) uglify
 * 6) concat
 * 7) remove
 * 8) string-replace
 * 9) usebanner
 * 10) watch
 */
module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 8889,
                    base: "dist",
                    livereload: true,
                    middleware: function (connect, options, defaultMiddleware) {
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        return [proxy].concat(defaultMiddleware);
                    }
                }
            }
        },

        open: {
            all: {
                path: 'http://localhost:8889/test'
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    'dist/css/bubbles-chart.css': 'src/scss/main.scss'
                }
            }
        },

        copy: {
            main: {
                files: [{
                        cwd: './test',
                        src: '**/*',
                        dest: 'dist/test',
                        expand: true
                    }
                ]
            }
        },

        uglify: {
            options: {
                report: ['none', 'min', 'gzip'],
                banner: "var BubbleChart =(function () {",
                footer: " return _BubbleChart;})();",
                mangle: {
                    except: ['jQuery', '$', '_BubbleChart', 'd3', 'd3plus']
                }
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist/tmp',
                    src: '*.js',
                    dest: 'dist/js',
                    ext: '.js',
                    extDot: 'last'
                }]
            }
        },
        concat: {
            options: {
                separator: ';\n'
            },
            libs: {
                src: [
                'src/js/layout-orbit.js',
                'src/js/d3.selectable.js',
                'src/js/config-builder.js',
                'src/js/events.js',
                'src/js/base-builder.js',
                'src/js/ui-builder.js',
                'src/js/bubble-animation.js',
                'src/js/bubble-builder.js',
                'src/js/tree-builder.js',
                'src/js/orbit-builder.js',
                'src/js/list-builder.js',
                'src/js/motion-bubble.js',
                'src/js/bubbles-chart.js'
                ],
                dest: 'dist/tmp/bubbles-chart.min.js'
            },
            libsfull: {
                src: [
                'src/vendors/jquery/dist/jquery.min.js',
                'src/vendors/d3/d3.min.js',
                'src/vendors/d3plus/d3plus.min.js',
                'src/vendors/d3-selectable/d3.selectable.js',
                'dist/js/bubbles-chart.min.js'
                ],
                dest: 'dist/js/bubbles-chart.full.js'
            }
        },

        remove: {
            default_options: {
                trace: true,
                dirList: ['dist/tmp']
            },
            clean: {
                dirList: ['dist']
            }
        },

        'string-replace': {
            inline: {
                files: {
                    'dist/': ['dist/js/*.js', 'dist/css/*.css'],
                },
                options: {
                    replacements: [{
                        pattern: /{{VERSION}}/g,
                        replacement: '<%= pkg.version %>'
                    }]
                }
            }
        },

        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '/*!\n' +
                        '  * <%= pkg.name %> : <%= pkg.description %>\n' +
                        '  * @version <%= pkg.version %>\n' +
                        '  * @author <%= pkg.author %>\n' +
                        '  */',
                    linebreak: true
                },
                files: {
                    src: ['dist/js/*.js', 'dist/css/*.css']
                }
            }
        },

        watch: {
            main: {
                options: {
                    livereload: true
                },
                files: ['src/**/*'],
                tasks: ['default']
            },
            test: {
                options: {
                    livereload: true
                },
                files: ['test/**/*'],
                tasks: ['default', 'copy']
            }
        }
    });

    grunt.registerTask('default', ['concat:libs', 'uglify', 'sass', 'string-replace', 'concat:libsfull', 'remove:default_options', 'usebanner']);
    grunt.registerTask('build', ["default"]);
    grunt.registerTask('serve', ['default', 'copy', 'configureProxies:server', "open", 'connect:server', 'watch']);
    grunt.registerTask('clean', ["remove:clean"]);
};
