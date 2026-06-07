import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGame, useGameDispatch } from './store/gameStore';
import { buildEventQueue, getAllEventsForAct, getActSummaryText, determineEnding } from './engine/eventEngine';
import CoverScreen from './components/CoverScreen';
import DioramaView from './components/DioramaView';
import StatsHUD from './components/StatsHUD';
import TimeDisplay from './components/TimeDisplay';
import EventPanel from './components/EventPanel';
import BlastMiniGame from './components/BlastMiniGame';
import ReformPoints from './components/ReformPoints';
import NewsBanner from './components/NewsBanner';
import ActSummary from './components/ActSummary';
import ConsequenceOverlay from './components/ConsequenceOverlay';
import SloganPuzzle from './components/SloganPuzzle';
import ElectionGame from './components/ElectionGame';
import VisitRoute from './components/VisitRoute';
import EndingScreen from './components/EndingScreen';

function getReformConsequence(allocation, act) {
  const max = Math.max(allocation.port, allocation.industry, allocation.housing, allocation.commerce);
  const dominant = Object.entries(allocation).filter(([, v]) => v === max && v > 0);

  if (dominant.length === 0) return null;

  const effects = { economy: 0, politics: 0, support: 0, innovation: 0 };
  effects.economy += allocation.port * 5 + allocation.commerce * 3;
  effects.innovation += allocation.industry * 5;
  effects.support += allocation.housing * 5;
  effects.politics += allocation.commerce * 2;

  const actTexts = {
    1: {
      balanced: {
        label: '均衡发展，四面开花',
        historyImage: '/images/history/shekou-construction-1980s.jpg',
        historyCaption: '上世纪80年代初建设中的蛇口',
        consequence: '袁庚把有限的资源撒向了蛇口的四个角落。码头装上了新的吊臂，厂房竖起了第一根烟囱，工人宿舍搭起了框架，商铺也划出了地块。什么都在建，什么都没建完——但蛇口的轮廓，第一次从图纸变成了现实。',
      },
      port: {
        label: '重点建设港口，打通海上通道',
        historyImage: '/images/history/port-construction-1979.jpg',
        historyCaption: '1979年8月，蛇口工业区顺岸码头施工现场',
        consequence: '三个月后，蛇口码头迎来了第一艘万吨巨轮。从香港运来的水泥、钢筋堆满了新建的仓库。渔民们站在岸边看着巨大的吊臂起落，喃喃道："这还是我们的蛇口吗？"港口区的工人拿到了第一笔超额奖金，其他区域的人开始眼红了。',
      },
      industry: {
        label: '重点发展工业，开办来料加工',
        historyImage: '/images/history/kaida-factory.jpg',
        historyCaption: '香港凯达玩具厂蛇口生产线场景',
        consequence: '第一批从香港转来的电子元件运到了蛇口。二十个女工坐在铁皮厂房里，在四十度的高温下组装收音机。效率不高，良品率也低——但这是大陆第一条"三来一补"生产线。消息传到北京，有人说这是"为资本家打工"。袁庚回了一句："打工怎么了？打出外汇来就是好的。"',
      },
      housing: {
        label: '优先兴建宿舍，安居才能乐业',
        historyImage: '/images/history/sihai-apartment.jpeg',
        historyCaption: '蛇口四海公寓',
        consequence: '第一栋工人宿舍楼拔地而起——四层，每层八间，公共厨房和卫生间。虽然简陋，但比帐篷和工棚强了十倍。搬进新宿舍的那天晚上，有人在楼道里放了一挂鞭炮。工人们有了归属感，出工的积极性明显提高了，就连隔壁工地的人也打听着要来蛇口。',
      },
      commerce: {
        label: '建设商贸中心，引入市场机制',
        historyImage: '/images/history/yongan-mall-1983.jpg',
        historyCaption: '1983年10月，永安商场开张，人们蜂拥而入',
        consequence: '蛇口出现了第一家"自选商店"——不用凭票，不用排队，货架上摆着从香港运来的日用品。工人们第一次见到罐装可乐和进口饼干。有人悄悄写信举报："蛇口在搞资本主义自由市场！"但更多的人从宝安、南头赶来，排着队进门。商业的活力，像水一样渗进了这片工地。',
      },
    },
    2: {
      balanced: {
        label: '全面扩建，蛇口初具规模',
        historyImage: '/images/history/shekou-plan-1981.jpg',
        historyCaption: '1981年招商局蛇口工业区平面规划示意图',
        consequence: '第二轮资金到位后，蛇口的每个角落都在同步扩张。港口新增了两个泊位，工厂区新建了三栋标准厂房，工人宿舍从四层加盖到六层，商业街也铺上了水泥路面。来蛇口参观的干部们感叹："这哪还是荒山野岭？分明是一座小城了。"',
      },
      port: {
        label: '扩建港口，提升吞吐量',
        historyImage: '/images/history/port-under-construction.jpg',
        historyCaption: '建设中的蛇口港',
        consequence: '蛇口港扩建工程如火如荼。新增的深水泊位可以停靠三万吨级货轮，集装箱堆场面积翻了一番。港口吞吐量的飙升引来了更多外商的关注——不只是港商，连日本和美国的贸易公司也开始打听蛇口的仓储费用。码头工人们加班加点，收入也水涨船高。',
      },
      industry: {
        label: '工业升级，引进先进设备',
        historyImage: '/images/history/sanyo-factory.jpg',
        historyCaption: '蛇口建成的日本独资企业三洋电机',
        consequence: '新一轮投资全部砸向了工业区。从日本引进的全自动生产线在新厂房里运转起来，产品良品率从60%跃升到95%。工人们惊叹于这些机器的精密——"一个机器人顶十个工人"。技术的差距让人既兴奋又焦虑，培训班的报名人数一夜之间爆满了。',
      },
      housing: {
        label: '大规模建设住宅，留住人才',
        historyImage: '/images/history/housing-bitaoyuan-1981.jpg',
        historyCaption: '1981年蛇口建成中国第一个商品房小区碧涛苑',
        consequence: '碧涛苑拔地而起——这是中国第一个商品房小区。带阳台、有独立卫生间、楼下还有花园。不只是工人，连深圳市区的干部都托关系打听能不能在蛇口买房。住房条件的改善让蛇口的人才流失率降到了最低，反而开始从周边"虹吸"人才。',
      },
      commerce: {
        label: '商业繁荣，打造消费中心',
        historyImage: '/images/history/nanhai-hotel-1984.jpg',
        historyCaption: '1984年落成的南海酒店——深圳市第一家五星级酒店',
        consequence: '蛇口的商业街越来越热闹了。除了日用品商店，还开了理发店、照相馆、甚至一家卡拉OK厅。工人们下班后终于有了去处，不用再闷在宿舍里打牌。南海酒店的筹建更是让蛇口有了"国际范"——外商来考察，终于不用住工棚了。',
      },
    },
    3: {
      balanced: {
        label: '精雕细琢，打造宜居新城',
        historyImage: '/images/history/shekou-construction-1980s.jpg',
        historyCaption: '80年代的蛇口工业区全貌',
        consequence: '邓小平视察后，蛇口的发展驶入快车道。港口的航道进行了疏浚，工厂装上了污水处理设备，住宅区增设了公共绿地，商业区引入了银行和邮局。蛇口不再只是一个工地——它正在变成一座真正的城市。',
      },
      port: {
        label: '港口现代化，接轨国际',
        historyImage: '/images/history/port-construction-1979.jpg',
        historyCaption: '蛇口港码头',
        consequence: '蛇口港引进了电子化调度系统，集装箱装卸效率达到了国际水平。港口的日吞吐量突破了一万吨大关，成了华南地区最繁忙的中小港口之一。远洋货轮在港外排起了长队，等着靠泊。',
      },
      industry: {
        label: '产业升级，从制造到创造',
        historyImage: '/images/history/glass-factory.jpg',
        historyCaption: '广东浮法玻璃厂——蛇口工业创新的象征',
        consequence: '蛇口的工厂开始告别简单的来料加工。广东浮法玻璃厂的建成标志着蛇口开始有了自己的技术含量。袁庚在厂房门口驻足良久："以前我们只能做别人让我们做的东西，现在我们开始做自己想做的东西了。"',
      },
      housing: {
        label: '完善配套，社区生活成形',
        historyImage: '/images/history/sihai-apartment.jpeg',
        historyCaption: '蛇口住宅区',
        consequence: '住宅区不再只有宿舍楼了。幼儿园、小学、卫生站一一建成。工人们的家属开始从老家赶来团聚，蛇口第一次有了"家"的氛围。蛇口正在从一个工业区，变成一个有烟火气的社区。',
      },
      commerce: {
        label: '金融起步，商业多元化',
        historyImage: '/images/history/yongan-mall-1983.jpg',
        historyCaption: '永安商场',
        consequence: '蛇口的商业已经不止是日用品买卖了。招商银行的前身——蛇口工业区财务公司悄然成立，开始办理外汇结算和小额贷款。蛇口，真的在和世界接轨了。',
      },
    },
  };

  const texts = actTexts[act] || actTexts[1];
  if (dominant.length >= 3) {
    return { ...texts.balanced, effects };
  }
  return { ...texts[dominant[0][0]], effects };
}

export default function App() {
  const state = useGame();
  const { phase, eventIndex, eventQueue, currentAct } = state;
  const dispatch = useGameDispatch();
  const [pendingChoice, setPendingChoice] = useState(null);

  const currentEvent = useMemo(() => {
    if (!eventQueue || eventQueue.length === 0) return null;
    const eventId = eventQueue[eventIndex];
    if (!eventId) return null;
    const allEvents = getAllEventsForAct(currentAct);
    return allEvents.find(e => e.id === eventId) || null;
  }, [eventQueue, eventIndex, currentAct]);

  useEffect(() => {
    if (phase === 'cover') return;
    if (eventQueue && eventQueue.length > 0) return;
    const queue = buildEventQueue(currentAct, state);
    dispatch({ type: 'SET_EVENT_QUEUE', payload: queue });
  }, [phase, currentAct]);

  const backgroundSrc = useMemo(() => {
    if (currentEvent?.background && phase !== 'cover' && phase !== 'summary') {
      return currentEvent.background;
    }
    const dioramaMap = {
      1: '/images/diorama-1979.png',
      2: '/images/diorama-1981.png',
      3: '/images/diorama-1983.png',
      4: '/images/diorama-1984.png',
    };
    return dioramaMap[currentAct] || '/images/diorama-1979.png';
  }, [currentEvent, phase, currentAct]);

  const videoSrc = useMemo(() => {
    if (currentEvent?.video && phase !== 'cover' && phase !== 'summary') {
      return currentEvent.video;
    }
    return null;
  }, [currentEvent, phase]);

  const advanceToNext = useCallback(() => {
    const nextIdx = eventIndex + 1;
    if (nextIdx >= eventQueue.length) {
      dispatch({ type: 'SET_PHASE', payload: 'summary' });
      return;
    }

    dispatch({ type: 'NEXT_EVENT' });
    dispatch({ type: 'ADVANCE_SEASON' });

    const nextEventId = eventQueue[nextIdx];
    const allEvents = getAllEventsForAct(currentAct);
    const next = allEvents.find(e => e.id === nextEventId);

    if (next?.type === 'ending') {
      dispatch({ type: 'SET_PHASE', payload: 'ending' });
    } else if (next?.type === 'minigame') {
      dispatch({ type: 'SET_PHASE', payload: next.minigame });
    } else {
      dispatch({ type: 'SET_PHASE', payload: 'event' });
    }
  }, [eventIndex, eventQueue, currentAct, dispatch]);

  const handleEventComplete = useCallback((choice) => {
    if (choice?.setFlags) {
      dispatch({ type: 'SET_FLAGS', payload: choice.setFlags });
    }
    if (choice?.removeFlags) {
      dispatch({ type: 'REMOVE_FLAGS', payload: choice.removeFlags });
    }
    if (choice?.consequence) {
      setPendingChoice(choice);
    } else {
      setTimeout(() => advanceToNext(), 3200);
    }
  }, [advanceToNext, dispatch]);

  const handleConsequenceDone = useCallback(() => {
    setPendingChoice(null);
    setTimeout(() => advanceToNext(), 800);
  }, [advanceToNext]);

  const handleBlastComplete = useCallback((result) => {
    dispatch({ type: 'APPLY_DECISION', payload: { effects: result.effects, label: '炸山填海' } });
    if (result.setFlags) {
      dispatch({ type: 'SET_FLAGS', payload: result.setFlags });
    }
    if (result.news) {
      dispatch({ type: 'SHOW_NEWS', payload: result.news });
    }
    setTimeout(() => advanceToNext(), 3200);
  }, [dispatch, advanceToNext]);

  const handleMinigameComplete = useCallback((result) => {
    if (result?.effects) {
      dispatch({ type: 'APPLY_DECISION', payload: { effects: result.effects, label: result.label || '小游戏' } });
    }
    if (result?.setFlags) {
      dispatch({ type: 'SET_FLAGS', payload: result.setFlags });
    }
    if (result?.news) {
      dispatch({ type: 'SHOW_NEWS', payload: result.news });
    }
    setTimeout(() => advanceToNext(), 2000);
  }, [dispatch, advanceToNext]);

  const handleReformComplete = useCallback((allocation) => {
    if (allocation) {
      const consequence = getReformConsequence(allocation, currentAct);
      if (consequence) {
        setPendingChoice(consequence);
        return;
      }
    }
    advanceToNext();
  }, [advanceToNext, currentAct]);

  const handleNextAct = useCallback(() => {
    const nextAct = currentAct + 1;
    if (nextAct > 4) {
      dispatch({ type: 'SET_PHASE', payload: 'ending' });
      return;
    }
    dispatch({ type: 'START_ACT', payload: nextAct });
    const queue = buildEventQueue(nextAct, state);
    dispatch({ type: 'SET_EVENT_QUEUE', payload: queue });

    const allEvents = getAllEventsForAct(nextAct);
    const firstEvent = allEvents.find(e => e.id === queue[0]);
    if (firstEvent?.type === 'minigame') {
      dispatch({ type: 'SET_PHASE', payload: firstEvent.minigame });
    } else {
      dispatch({ type: 'SET_PHASE', payload: 'event' });
    }
  }, [currentAct, state, dispatch]);

  const handleRestart = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="game-container">
      {phase !== 'cover' && <DioramaView src={backgroundSrc} videoSrc={videoSrc} />}
      {phase !== 'cover' && phase !== 'summary' && phase !== 'ending' && <StatsHUD />}
      {phase !== 'cover' && phase !== 'summary' && phase !== 'ending' && <TimeDisplay />}

      {phase === 'cover' && <CoverScreen />}

      {phase === 'event' && currentEvent && (
        <EventPanel
          key={currentEvent.id}
          event={currentEvent}
          onComplete={handleEventComplete}
        />
      )}

      {phase === 'blast' && currentEvent && (
        <BlastMiniGame
          event={currentEvent}
          onComplete={handleBlastComplete}
        />
      )}

      {phase === 'reform' && (
        <ReformPoints onComplete={handleReformComplete} />
      )}

      {phase === 'slogan' && currentEvent && (
        <SloganPuzzle
          event={currentEvent}
          onComplete={handleMinigameComplete}
        />
      )}

      {phase === 'election' && currentEvent && (
        <ElectionGame
          event={currentEvent}
          onComplete={handleMinigameComplete}
        />
      )}

      {phase === 'visit' && currentEvent && (
        <VisitRoute
          event={currentEvent}
          onComplete={handleMinigameComplete}
        />
      )}

      {phase === 'summary' && (
        <ActSummary
          actNumber={currentAct}
          summaryData={getActSummaryText(currentAct)}
          onNextAct={currentAct < 4 ? handleNextAct : null}
          onRestart={handleRestart}
        />
      )}

      {phase === 'ending' && (
        <EndingScreen
          ending={determineEnding(state)}
          onRestart={handleRestart}
        />
      )}

      {pendingChoice && (
        <ConsequenceOverlay
          choice={pendingChoice}
          onComplete={handleConsequenceDone}
        />
      )}

      <NewsBanner />
    </div>
  );
}
