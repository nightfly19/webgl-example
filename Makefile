#!/bin/bash

filename = resources/js/mine.js
source = src/mine.js


.PHONY:
all:
	echo "Ensure hard links match";
	rm $(filename)
	ln $(source) $(filename)

.PHONY:
lint:
	jslint --browser true --passfail false --maxerr 50 --devel true $(source)
