import { act1Events } from '../data/act1Events';
import { act2Events } from '../data/act2Events';
import { act3Events } from '../data/act3Events';
import { act4Events } from '../data/act4Events';

const ACT_EVENTS = {
  1: act1Events,
  2: act2Events,
  3: act3Events,
  4: act4Events,
};

export function getAllEventsForAct(act) {
  return ACT_EVENTS[act] || [];
}

export function getEventById(act, id) {
  const events = getAllEventsForAct(act);
  return events.find(e => e.id === id) || null;
}

function checkConditions(conditions, state) {
  if (!conditions) return true;

  if (conditions.flags) {
    if (!conditions.flags.every(f => state.flags.includes(f))) return false;
  }

  if (conditions.notFlags) {
    if (conditions.notFlags.some(f => state.flags.includes(f))) return false;
  }

  if (conditions.minStats) {
    for (const [key, min] of Object.entries(conditions.minStats)) {
      if ((state.stats[key] ?? 0) < min) return false;
    }
  }

  if (conditions.maxStats) {
    for (const [key, max] of Object.entries(conditions.maxStats)) {
      if ((state.stats[key] ?? 100) > max) return false;
    }
  }

  if (conditions.reform) {
    for (const [key, minVal] of Object.entries(conditions.reform)) {
      if ((state.reformPoints[key] ?? 0) < minVal) return false;
    }
  }

  if (conditions.or) {
    if (!conditions.or.some(sub => checkConditions(sub, state))) return false;
  }

  return true;
}

export function buildEventQueue(act, state) {
  const allEvents = getAllEventsForAct(act);
  return allEvents
    .filter(evt => checkConditions(evt.conditions, state))
    .map(e => e.id);
}

export function getActSummaryText(act) {
  const summaries = {
    1: {
      title: '1979年度总结',
      text: '蛇口工业区的第一年就这样过去了。从一片荒芜的渔村到初具雏形的工业区——开山炮响了，码头建起来了，第一批工厂在筹建。每一个决策都在塑造这片土地的未来。',
    },
    2: {
      title: '1980-1982年总结',
      text: '制度突破的三年。标语竖起来了，合同签下来了，铁饭碗和铁椅子一个接一个被打破。蛇口这块2.14平方公里的试验田上，正在长出中国改革的新芽。',
    },
    3: {
      title: '1983-1984年总结',
      text: '历史性的两年。民主选举开了先河，明华轮变成了"海上世界"，邓小平亲临蛇口肯定了改革方向。蛇口的经验开始影响全中国。',
    },
    4: {
      title: '1985-1988年总结',
      text: '蛇口模式走向成熟。住房商品化、招商银行、平安保险、蛇口风波——从2.14平方公里的试验田上，走出了改变中国的力量。',
    },
  };
  return summaries[act] || summaries[1];
}

export function determineEnding(state) {
  const { economy, politics, support, innovation } = state.stats;

  if (economy < 20 || politics < 20 || support < 20 || innovation < 20) {
    const collapsed = [];
    if (economy < 20) collapsed.push('经济');
    if (politics < 20) collapsed.push('政治');
    if (support < 20) collapsed.push('民心');
    if (innovation < 20) collapsed.push('创新');
    return {
      id: 'E',
      title: '改革夭折',
      subtitle: `${collapsed.join('、')}崩溃`,
      text: '蛇口的改革实验最终未能坚持下来。也许是步子太大，也许是时机未到。\n\n但历史会记住这次勇敢的尝试——这片土地上播下的种子，终有一天会在别处发芽。袁庚说过："我一半是做梦，一半是在做现实。"\n\n梦暂时醒了，但那颗改革的心，从未停止跳动。',
      tone: 'tragic',
      historyImage: '/images/history/shekou-newspaper-frontpage.jpg',
      historyCaption: '深圳特区报——记录着改革开放的每一步',
    };
  }

  const hasSlogan = state.flags.includes('erected_slogan');
  const hasCMB = state.flags.includes('cmb_founded');
  const hasPingan = state.flags.includes('pingan_founded');
  const hasDengImpressed = state.flags.includes('deng_impressed');
  const defendedValues = state.flags.includes('defended_market_values');

  const focusStats = [
    { key: 'politics', val: politics },
    { key: 'support', val: support },
    { key: 'innovation', val: innovation },
  ].sort((a, b) => b.val - a.val);

  const topFocus = focusStats[0];
  const bottomFocus = focusStats[2];
  const allAbove50 = economy >= 50 && politics >= 50 && support >= 50 && innovation >= 50;
  const weakCount = [politics, support, innovation].filter(s => s < 50).length;

  if (allAbove50 && (topFocus.val - bottomFocus.val) < 20) {
    const extras = [];
    if (hasCMB) extras.push('招商银行');
    if (hasPingan) extras.push('平安保险');
    if (hasSlogan) extras.push('"时间就是金钱"标语');
    if (defendedValues) extras.push('蛇口风波中的价值观捍卫');

    return {
      id: 'A',
      title: '改革先锋',
      subtitle: '蛇口模式，全国推广',
      text: `经济繁荣、政治稳健、民心所向、创新不断——蛇口成为了中国改革开放的标杆。\n\n${hasDengImpressed ? '邓小平视察后的充分肯定，让蛇口的经验走向了全国。' : ''}从这片2.14平方公里的土地上走出了24项全国首创${extras.length > 0 ? '，包括' + extras.join('、') : ''}。\n\n"蛇口模式"深刻影响了中国未来四十年的发展道路。袁庚——这位从抗日战场走来的改革者，终于可以说：我们杀出了一条血路来。\n\n2016年1月31日，袁庚在深圳逝世，享年99岁。中共中央追授他"改革先锋"称号。`,
      tone: 'triumph',
      historyImage: '/images/history/slogan-original-photo.jpg',
      historyCaption: '"时间就是金钱，效率就是生命"——这句口号从蛇口走向了全中国',
    };
  }

  if (weakCount >= 2) {
    return {
      id: 'B',
      title: '经济奇迹',
      subtitle: '财富涌动，代价几何',
      text: '蛇口的GDP增速连年全国第一。高楼大厦拔地而起，外资蜂拥而至，港口吞吐量节节攀升。\n\n但繁华背后有隐忧——工人们抱怨加班太多，传统干部们忧心忡忡，文化生活乏善可陈。蛇口创造了经济奇迹，但这座城市似乎少了点什么——也许是人情味，也许是灵魂。\n\n袁庚在晚年反思："我们太着急了。赚到了钱，却可能丢了一些更重要的东西。"',
      tone: 'bittersweet',
      historyImage: '/images/history/shekou-modern-aerial.jpg',
      historyCaption: '今日的蛇口——从荒芜渔村到现代化新城',
    };
  }

  if (topFocus.val - focusStats[1].val >= 15) {
    if (topFocus.key === 'politics') {
      return {
        id: 'C',
        title: '政治样板',
        subtitle: '安全着陆，步履蹒跚',
        text: '蛇口的每一步改革都在安全线内。上级对蛇口的工作非常满意，从未收到过一封批评信。\n\n但袁庚心里清楚：太过谨慎，让蛇口错过了很多机会。隔壁的深圳已经一日千里，而蛇口还在"稳步推进"。\n\n"改革，有时候需要的不是稳妥，而是勇气。"袁庚在退休后的回忆录里写道，"我不后悔谨慎，但我后悔的是——在该大胆的时候，我犹豫了。"',
        tone: 'reflective',
        historyImage: '/images/history/shekou-panorama-today.jpg',
        historyCaption: '蛇口全景',
      };
    }

    if (topFocus.key === 'support') {
      return {
        id: 'D',
        title: '民心丰碑',
        subtitle: '工人的乐园',
        text: '蛇口的工人们过上了全国最好的日子。宿舍宽敞明亮，食堂饭菜可口，社会保险齐全，民主选举照常举行。工人们发自内心地热爱这片土地。\n\n但外面的人却说：蛇口像个大院，什么都好，就是不像改革开放。经济数据平平，创新乏力——幸福的代价，是错过了一个时代。\n\n袁庚说："让工人过上好日子，本身就是改革的目的。但只有好日子还不够——我们还要给后代留下一条更好的路。"',
        tone: 'warm',
        historyImage: '/images/history/workers-cycling-1980s.jpg',
        historyCaption: '80年代蛇口的工人们',
      };
    }

    if (topFocus.key === 'innovation') {
      return {
        id: 'F',
        title: '制度先驱',
        subtitle: '改革之火，照亮前路',
        text: '蛇口也许不是最富有的，但它是中国最有创造力的地方。从4分钱改革到股份制银行，从劳动合同到社会保险——每一项制度创新都走在了全国前面。\n\n蛇口的价值不在于它创造了多少财富，而在于它证明了另一种可能——在中国，市场经济是可行的，制度创新是可能的，改革是有希望的。\n\n这些从蛇口走出的制度，后来在全国生根发芽，深刻改变了十四亿中国人的生活。',
        tone: 'triumph',
        historyImage: '/images/history/shekou-museum-interior.jpg',
        historyCaption: '蛇口改革开放博物馆——记录制度创新的历程',
      };
    }
  }

  return {
    id: 'A',
    title: '改革先锋',
    subtitle: '蛇口精神，薪火相传',
    text: '蛇口走出了一条属于自己的路。虽然不完美，但这片土地证明了：改革是可能的，开放是必要的。\n\n从1979年的开山第一炮到1988年的蛇口模式，从一个人的冒险到24项全国第一——蛇口用十年时间，在中国改革开放的历史上写下了浓墨重彩的一笔。\n\n"时间就是金钱，效率就是生命。"这句从蛇口发出的声音，至今仍回荡在中国大地上。',
    tone: 'triumph',
    historyImage: '/images/history/blast-first-shot-1979.jpg',
    historyCaption: '1979年7月8日，改革开放"开山第一炮"在蛇口炸响',
  };
}
