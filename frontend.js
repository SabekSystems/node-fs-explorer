function log(argument) {
    console.log("log", argument)
}

function error(argument) {
    console.log("error", argument)
}

var app = {
    controller: function(args) {
        var files = m.request({
            method: "post",
            url: "/files",
            background: true,
            data: {
                path: (m.route.param("path") ? m.route.param("path") : "./")
            }
        })

        files.then(m.redraw)

        return {
            files: files,
            path: m.prop((m.route.param("path") ? m.route.param("path") : "")),
            jump: m.prop(""),
            symlinkSource: m.prop(""),
            symlinkTarget: m.prop(""),
            createName: m.prop("")
        }
    },
    view: function(ctrl, args) {
        return ctrl.files() ? body(ctrl) : m("pre", "loading " + m.route.param("path"))
    }
}

function body(ctrl) {
    return m("div", [
        ctrl.path(),
        m("form", {
            onsubmit: function(e) {
                ctrl.path(ctrl.jump())
                console.log(ctrl.path())
                m.route("/", {
                        path: ctrl.path()
                    })
                    // m.redraw()
                e.preventDefault()
            }
        }, [
            m("input", {
                placeholder: "jump to...",
                oninput: m.withAttr("value", ctrl.jump)
            })
        ]),


        ctrl.files().type == "folder" ? generateLinks(ctrl, ctrl.files) : showContent(ctrl, ctrl.files)
    ])
}

function generateLinks(ctrl, files) {
    return m("div", [
        m("form", {
            onsubmit: function(e) {

                m.request({
                        method: 'post',
                        url: "/create",
                        data: {
                            type: "symlink",
                            source: ctrl.symlinkSource(),
                            target: ctrl.symlinkTarget()
                        }
                    }).then(m.route(m.route()))
                    // m.redraw()
                e.preventDefault()
            }
        }, [

            m("br"),
            m("input", {
                placeholder: "source",
                oninput: m.withAttr("value", ctrl.symlinkSource)
            }),
            m("input", {
                placeholder: "target",
                oninput: m.withAttr("value", ctrl.symlinkTarget)
            }),
            m("button", "relative symlink!"),
        ]),

        m("form", {
            onsubmit: function(e) {
                e.preventDefault()
            }
        }, [

            m("br"),
            m("input", {
                placeholder: "name...",
                oninput: m.withAttr("value", ctrl.createName)
            }),
            m("button", {
                onclick: function(e) {
                    m.request({
                        method: 'post',
                        url: "/create",
                        data: {
                            type: "folder",
                            path: ctrl.path(),
                            name: ctrl.createName()
                        }
                    }).then(m.route(m.route())).catch(e => {
                        alert(JSON.stringify(e, null, "\t"))
                    })
                    e.preventDefault()
                }
            }, "create as folder"),
            m("button", {
                onclick: function(e) {
                    m.request({
                        method: 'post',
                        url: "/create",
                        data: {
                            type: "file",
                            path: ctrl.path(),
                            name: ctrl.createName()
                        }
                    }).then(m.route(m.route()))
                    e.preventDefault()
                }
            }, "create as file"),
        ]),
        m("ul", files().content.map(function(file) {
            return m("a", {
                href: "javascript:void(0);",
                onclick: function(e) {
                    ctrl.path(ctrl.path() + (ctrl.path() == "" ? "" : "/") + file)

                    console.log(ctrl.path())
                    m.route("/", {
                            path: ctrl.path()
                        })
                        // m.redraw()
                }
            }, file + " ", [
                m("button", "delete"),
                m("button", "edit"),
            ], m("br"))
        }))
    ])
}

function showContent(ctrl, files) {
    return m("editor", [
        m("pre", {
            contenteditable: true
        }, files().content),
        m("button", "save")
    ])
}

m.route.mode = "hash"
m.route(document.body, "/", {
    "/": app
})
