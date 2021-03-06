"use strict";

const CHILDREN_NUM = 200;

module.exports = {
    'react' : require('./react')(CHILDREN_NUM),
    'preact' : require('./preact')(CHILDREN_NUM),
    'inferno' : require('./inferno')(CHILDREN_NUM),
    'vidom' : require('./vidom')(CHILDREN_NUM),
    'vue' : require('./vue')(CHILDREN_NUM)
};
