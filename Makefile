#!/bin/bash

filename = resources/js/mine.js
source = src/mine.js


.PHONY:
all:
	echo "Ensure hard links match";
	rm $(filename)
	ln $(source) $(filename)
