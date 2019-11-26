# chaincode install
docker exec cli peer chaincode install -n sacc -v 0.1 -p github.com/sacc
sleep 5

# chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 0.1 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
# docker exec cli peer chaincode upgrade -n sacc -v 0.2 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5

# TEST FOR INSTANTIATE
echo '===================================== TEST START ====================================='

echo '---------------------------------------- USER ----------------------------------------'

# setUser
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 생성 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setUser", "6d42a71d35eb3287c30c79afeea55ce35de0b21e91ba0325d07d496c09ea1bda", "홍길동", "1995", "0"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setUser", "6c866052b2732303232a95bc2af27111266b4ff18825779f3ca98f8954d33fa5", "아무개", "1995", "0"]}'
sleep 2

# # getUser
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUser", "6d42a71d35eb3287c30c79afeea55ce35de0b21e91ba0325d07d496c09ea1bda"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUser", "6c866052b2732303232a95bc2af27111266b4ff18825779f3ca98f8954d33fa5"]}'
# sleep 2

# # getUserByName
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 이름으로 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUserByName", "홍길동"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUserByName", "아무개"]}'
# sleep 2

# # getAllUsers
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 전체 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllUsers"]}'
# sleep 2

echo '--------------------------------------------------------------------------------------'

echo '---------------------------------------- QUIZ ----------------------------------------'

# setVote
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 생성 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setVote", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c", "0", "2019-11-10 00:00:00", "2019-11-11 00:00:00", "박보검", "박보영", "1000"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setVote", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f", "1", "2019-11-13 00:00:00", "2019-11-14 00:00:00", "우마", "헌터퐝", "0"]}'
sleep 2

# # getVote
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVote", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVote", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
# sleep 2

# # getVote
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 상태로 조회 테스트(상태 변경 전) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "0"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "1"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "2"]}'
# sleep 2

# getAllVotes
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 전체 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllVotes"]}'
sleep 2

echo '--------------------------------------------------------------------------------------'

sleep 1

echo '---------------------------------------- Etc -----------------------------------------'

# # 투표 불가능 테스트
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 불가능 테스트(투표 전) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c", "0", "홍길동", "1"]}'
# sleep 2

# changeVoteStatus
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 상태 변경 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
sleep 2

# # getVote
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 상태로 조회 테스트(상태 변경 후) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "0"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "1"]}'
# sleep 2
# docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getVoteByStatus", "2"]}'
# sleep 2


# choice
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c", "박보영", "홍길동", "1"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c", "박보영", "아무개", "1"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f", "우마", "아무개", "3"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f", "우마", "홍길동", "2"]}'
sleep 2

# # 중복 투표 테스트
# echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 중복 투표 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
# docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c", "1", "홍길동", "100"]}'
# sleep 2

# 투표 불가능 테스트(투표 종료)
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 불가능 테스트(투표 종료) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeVoteStatus", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c"]}'
sleep 2
# docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f", "1", "홍길동", "2"]}'
# sleep 2

# getVote
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Vote 이력 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getHistoryByVoteId", "2d7b42d089129b234caa94c728406cc548dd5593c8a6fc55ee86a3e62f5b819c"]}'
sleep 2
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getHistoryByVoteId", "724f0e7da790374cec1b52c82db372b340949be200820100e584eff369dbda9f"]}'
sleep 2

echo '========================================================================================================================================================='

# getAllVotes
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 결과 - 유저 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllUsers"]}'
sleep 2

echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 결과 - 퀴즈 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllVotes"]}'
sleep 2


echo '--------------------------------------------------------------------------------------'

echo '===================================== Test END ====================================='

