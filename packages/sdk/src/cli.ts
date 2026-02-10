#!/usr/bin/env node

import { expose } from "./index";

const port = Number(process.argv[2] || 3000);

expose(port);
