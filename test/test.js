import compose_tree from "../js/compose_tree"

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
                            }
                        },
                        Nick: {
                            Costel: {},
                            Pete: {},
                            Barbara: {},
                            Vasile: {}
                        }
                    }
                }
            );
        });
    });
});