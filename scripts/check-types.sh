#!/bin/bash
# Quick type check
npx tsc --noEmit --pretty 2>&1 | head -30
