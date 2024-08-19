// Helper function to create a new tree node
function createNode(value = '') {
    return { value, children: [], id: Date.now() + Math.random(), focus: false, parent: null };
}

// Mithril Component as a Closure
function TreeBuilder() {
    let tree = [createNode()];  // Initial tree with one root node

    function renderTree(nodes, parent) {
        return m('ul',
            nodes.map((node, index) => {
                node.parent = parent; // Set parent reference
                return m('li',
                    m('input[type=text]', {
                        value: node.value,
                        id: node.id,
                        oninput: (e) => node.value = e.target.value,
                        onkeydown: (e) => handleKeydown(e, node, index, nodes),
                        oncreate: (vnode) => {
                            if (node.focus) {
                                vnode.dom.focus();
                                node.focus = false;
                            }
                        },
                        onupdate: (vnode) => {
                            if (node.focus) {
                                vnode.dom.focus();
                                node.focus = false;
                            }
                        }
                    }),
                    node.children.length > 0 ? renderTree(node.children, node) : null
                );
            })
        );
    }

    function handleKeydown(e, node, index, siblings) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newNode = createNode();
            newNode.focus = true;
            siblings.splice(index + 1, 0, newNode);
            m.redraw();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (index > 0) {
                const previousNode = siblings[index - 1];
                node.focus = true;
                previousNode.children.push(node);
                siblings.splice(index, 1);
                m.redraw();
            }
        } else if (e.key === 'Backspace' && node.value === '') {
            e.preventDefault();
            if (siblings.length === 1) {
                const parentInput = document.getElementById(node.parent.id);
                siblings.splice(index, 1);
                m.redraw();
                requestAnimationFrame(() => {
                    if (parentInput) parentInput.focus();
                });
            } else if (index > 0) {
                const previousSibling = document.getElementById(siblings[index - 1].id);
                siblings.splice(index, 1);
                m.redraw();
                requestAnimationFrame(() => {
                    if (previousSibling) previousSibling.focus();
                });
            } else {
                const nextSibling = document.getElementById(siblings[index + 1].id);
                siblings.splice(index, 1);
                m.redraw();
                requestAnimationFrame(() => {
                    if (nextSibling) nextSibling.focus();
                });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index > 0) {
                // Move focus to the previous sibling
                const previousSibling = document.getElementById(siblings[index - 1].id);
                if (previousSibling) previousSibling.focus();
            } else if (node.parent) {
                // Move focus to the parent
                const parentInput = document.getElementById(node.parent.id);
                if (parentInput) {
                    parentInput.focus();
                } else if (node.parent && node.parent.parent) {
                    // If parent has a previous sibling, move focus to its last child or the sibling itself
                    const parentIndex = node.parent.parent.children.indexOf(node.parent);
                    if (parentIndex > 0) {
                        const parentSibling = node.parent.parent.children[parentIndex - 1];
                        if (parentSibling.children.length > 0) {
                            const lastChild = document.getElementById(parentSibling.children[parentSibling.children.length - 1].id);
                            if (lastChild) lastChild.focus();
                        } else {
                            const previousParentSibling = document.getElementById(parentSibling.id);
                            if (previousParentSibling) previousParentSibling.focus();
                        }
                    }
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (node.children.length > 0) {
                // Move focus to the first child
                const firstChild = document.getElementById(node.children[0].id);
                if (firstChild) firstChild.focus();
            } else if (index < siblings.length - 1) {
                // Move focus to the next sibling
                const nextSibling = document.getElementById(siblings[index + 1].id);
                if (nextSibling) nextSibling.focus();
            } else if (node.parent && node.parent.parent) {
                // Move focus to the next sibling of the parent
                const parentIndex = node.parent.parent.children.indexOf(node.parent);
                if (parentIndex < node.parent.parent.children.length - 1) {
                    const parentSibling = document.getElementById(node.parent.parent.children[parentIndex + 1].id);
                    if (parentSibling) parentSibling.focus();
                }
            }
        }
    }

    return {
        view: function () {
            return m('div', renderTree(tree, null));
        }
    };
}

// Initialize Mithril application
m.mount(document.getElementById('app'), TreeBuilder);
