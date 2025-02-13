#!/bin/bash
#gnome-terminal -t "pypy3" -x bash -c "pypy3;exec bash;"
{
	echo "Lunching aigc frontend"
	cd /frontend/codes/
	sh
}

wait