#!/bin/bash

set -a
source .env.test
set +a

pulumi logout
pulumi login
