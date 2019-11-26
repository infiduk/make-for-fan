# chaincode install
docker exec cli peer chaincode install -n sacc -v 0.1 -p github.com/sacc
sleep 5

# chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 0.1 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
# docker exec cli peer chaincode upgrade -n sacc -v 0.2 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5

# TEST FOR INSTANTIATE
echo '===================================== TEST START ====================================='
echo '---------------------------------------- QUIZ ----------------------------------------'

# setVote
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 생성 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setVote", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f", "1", "테스트2", "2019-11-13 00:00:00", "2019-11-14 00:00:00", "1", "2"]}'
sleep 2

echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ update □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
sleep 2

echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ update □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
sleep 2

echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 결과 - 퀴즈 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllVotes"]}'
sleep 2


echo '--------------------------------------------------------------------------------------'

echo '===================================== Test END ====================================='

