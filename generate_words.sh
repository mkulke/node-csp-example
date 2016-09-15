#!/bin/bash
for i in $(seq 100)
do
  N=$(cat /usr/share/dict/words | wc -l)
  L=$(( ($RANDOM * 32768 + $RANDOM) % N ))
  cat /usr/share/dict/words | head -$L | tail -1
done
