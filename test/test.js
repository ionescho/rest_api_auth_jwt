import compose_tree from '../js/compose_tree.js';

var assert = require('assert');
describe('Unit tests', function() {
    describe('test compose_tree', function() {
        it('check return of function', function() {
            assert.deepEqual(compose_tree({
                Mihai:"Cristi",
                Costel: "Nick",
                Pete: "Nick",
                Barbara: "Nick",
                Nick: "Sophie",
                Cristi:"Sophie",
                Sophie: "Jonas",
                Vasile: "Nick"
            }),
                {
                    Jonas: {
                        Sophie: {
                            Cristi: {
                                Mihai: {}
                            },
                            Nick: {
                                Costel: {},
                                Pete: {},
                                Barbara: {},
                                Vasile: {}
                            },
                        },
                    }
                }
            );
        });
        //Circular reference: Jonas is both the top-most supervisor and an employee of Nick
        it('check circular reference error catch', function() {
            try {
                compose_tree({
                    Mihai:"Cristi",
                    Costel: "Nick",
                    Pete: "Nick",
                    Barbara: "Nick",
                    Nick: "Sophie",
                    Cristi:"Sophie",
                    Sophie: "Jonas",
                    Vasile: "Nick"
                });
            } catch(error) {
                assert.equal(error.message, "Circular reference!");
            }
        });
        //
        it('check for multiple roots', function() {
            try {
                compose_tree({
                    Mihai:"Cristi",
                    Costel: "Nick",
                    Pete: "Nick",
                    Barbara: "Nick",
                    Nick: "Sophie",
                    Cristi:"Sophie",
                    Sophie: "Jonas",
                    Vasile: "Nick",
                    Brittany: "Carlos"
                });
            } catch(error) {
                assert.equal(error.message, "Multiple roots detected in tree!");
            }
        });
    });
});