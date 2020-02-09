let compose_tree = (employees) => {
    let [rootRef, passedNodes] = [{},{}];
    for(var child in employees) {
        traverse_upwards(child, {});
    }
    return rootRef;


    function traverse_upwards(employee, pN, circularReferenceCheck = {}) {
        let supervisor = employees[employee];
        if (circularReferenceCheck[supervisor]) {
            throw new Error("Circular reference")
        }
        circularReferenceCheck[employee] = true;
        if (!passedNodes[employee]) {
            passedNodes[employee] = {
                [employee]: pN
            };
        }

        if (employees[supervisor]) {
            if (!passedNodes[supervisor]) {
                traverse_upwards(supervisor, passedNodes[employee], circularReferenceCheck);
            }
            passedNodes[supervisor][supervisor][employee] = passedNodes[employee][employee];
        } else {
            //this is the root of the tree
            rootRef = {
                [supervisor]: passedNodes[employee]
            };
        }
    }
}

export default compose_tree;