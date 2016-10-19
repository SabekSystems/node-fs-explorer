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
            data: {
                path: (m.route.param("path") ? m.route.param("path") : "./")
            }
        })

        files.then(log, error)

        return {
            files: files,
            path: m.prop((m.route.param("path") ? m.route.param("path") : "")),
            jump: m.prop("")
        }
    },
    view: function(ctrl, args) {
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
}

function generateLinks(ctrl, files) {
    return m("ul", files().content.map(function(file) {
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
        }, file, m("br"))
    }))
}

function showContent(ctrl, files) {
    return m("pre", files().content)
}

m.route.mode = "hash"
m.route(document.body, "/", {
    "/": app
})
