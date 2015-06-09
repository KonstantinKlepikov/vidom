module.exports = {
    "name" : "removeAttr2",
    "trees" : [
        {
            "tag" : "input",
            "attrs" : {
                "value" : "text",
                "className" : "input"
            }
        },
        {
            "tag" : "input"
        }
    ],
    "patch" : [
        {
            "type" : 3,
            "path" : "",
            "attrName" : "value"
        },
        {
            "type" : 3,
            "path" : "",
            "attrName" : "className"
        }
    ]
};