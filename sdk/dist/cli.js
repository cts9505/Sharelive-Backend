#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const port = Number(process.argv[2] || 3000);
(0, index_1.expose)(port);
