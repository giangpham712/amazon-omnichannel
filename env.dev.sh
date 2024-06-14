#!/bin/bash

set -a
source .env.dev
set +a

pulumi logout
pulumi login
