const voteModel = require('../model/vote');
const moment = require('./moment');

class Time {
    // 퀴즈 상태 초기화
    async initVoteStatus() {
        try {
            // '생성됨' 상태인 퀴즈 조회
            const result = await voteModel.getVoteByStatus("0");
            const obj = JSON.parse(result);
            for(let i = 0; i < obj.length; i++) {
                let res = obj[i];
                console.log("0: " + JSON.stringify(res));
                if(this.isDatePassed(res.begin)) {
                    await voteModel.changeVoteStatus(res.id);
                } else {
                    this.registerTimer(res.id, res.begin);
                }
            }
        } catch (error) {
            console.log(error);
            return;
        }             
            // MVCC_READ_CONFLICT
            // 투표 시작 시간과 종료 시간이 동시에 경과한 새 투표를 등록하는 경우 발생

        try {
            // '퀴즈 진행 중' 상태인 퀴즈 조회
            const result = await voteModel.getVoteByStatus("1");
            const obj = JSON.parse(result);
            for(let i = 0; i < obj.length; i++) {
                let res = obj[i];
                console.log("1: " + JSON.stringify(res));
                if(this.isDatePassed(res.end)) {
                    await voteModel.changeVoteStatus(res.id);
                } else {
                    this.registerTimer(res.id, res.end);
                }
            }
        } catch(error) {
            console.log(error);
            return;
        } 
    }

    // 경과 여부 확인
    isDatePassed(referenceDate) {
        return moment(referenceDate).isBefore(moment()) ? true : false;
    }

    // 타이머 등록
    registerTimer(id, referenceDate) {
        setTimeout(async () => { // 완료시간 경과 안됐으면 상태 변경 타이머 작동
            await voteModel.changeVoteStatus(id);
        }, moment(referenceDate).diff(moment()));
    }
}

module.exports = new Time();