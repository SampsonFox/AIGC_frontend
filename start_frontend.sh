#!/bin/bash
# gnome-terminal -t "pypy3" -x bash -c "pypy3;exec bash;"
{
	echo "Lunching aigc frontend"
	cd /frontend/codes/AIGC_frontend/AIGC_frontend/nova_aigc/
#	yarn install
	yarn start
}
wait