#!/bin/bash

filename = resources/js/mine.js
source = src/mine.js


.PHONY:
all:
	echo "Building:";
	echo "" > $(filename);
	cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $(source) > $(filename);
