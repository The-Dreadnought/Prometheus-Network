#!/bin/bash -xv

CONTAINER_NAME="$1"
docker start "$CONTAINER_NAME"
docker exec -it "$CONTAINER_NAME" cat /node_root/home/PrometheusNode_rCURRENT.log
