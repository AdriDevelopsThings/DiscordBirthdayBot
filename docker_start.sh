__='
   This is the default license template.
   
   File: docker_start.sh
   Author: AdriBloober
   Copyright (c) 2021 AdriBloober
   
   To edit this license information: Press Ctrl+Shift+P and press 'Create new License Template...'.
'

#!/bin/bash
set -e
yarn run knex --env production migrate:latest
yarn run start
