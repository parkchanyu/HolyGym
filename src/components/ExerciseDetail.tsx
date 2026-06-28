/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCw, Activity, Calendar, Trophy, 
  BookOpen, AlertTriangle, MessageSquare, Dumbbell, Info, TrendingUp 
} from 'lucide-react';
import { Exercise, CompletedWorkout, ExerciseCategory } from '../types';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
  completedWorkouts: CompletedWorkout[];
}

// 3D Projection configuration
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

export default function ExerciseDetail({
  exercise,
  onBack,
  completedWorkouts
}: ExerciseDetailProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'records' | 'guide'>('guide');
  const [activeGuideSubTab, setActiveGuideSubTab] = useState<'comment' | 'instructions' | 'precautions'>('comment');

  // Animation and 3D Rotation State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);
  const [orbitAngle, setOrbitAngle] = useState<number>(35); // Initial tilt angle in degrees

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Animation Loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      
      if (isPlaying) {
        setTime((prev) => (prev + (elapsed * 0.003)) % (Math.PI * 2));
      }
      
      lastTimeRef.current = timestamp;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Project 3D point to 2D screen coordinate
  const project = (pt: Point3D): Point2D => {
    const angleRad = (orbitAngle * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    
    // Rotate around Z-axis (horizontal orbit)
    const rx = pt.x * cosA - pt.y * sinA;
    const ry = pt.x * sinA + pt.y * cosA;
    
    // Canvas dimensions: width = 400, height = 280
    const cx = 200;
    const cy = 145;
    
    // Projection scale coefficients
    const screenX = cx + rx * 1.3;
    const screenY = cy + ry * 0.55 - pt.z * 1.1;
    
    return { x: screenX, y: screenY };
  };

  // Helper to get specialized content for each exercise
  const getExerciseGuideData = () => {
    const id = exercise.id;
    
    const guides: Record<string, {
      coachComment: string;
      instructions: string[];
      precautions: string[];
      equipment: { name: string; desc: string; type: 'barbell' | 'bench' | 'plates' | 'dumbbell' | 'machine' | 'treadmill' }[];
    }> = {
      'bench-press': {
        coachComment: '가슴 운동 중 가장 대중적이고 효과적인 복합 관절 운동이에요. 벤치프레스만 잘 해도 크고 탄탄한 대흉근을 가질 수 있어요!',
        instructions: [
          '벤치에 누워 발바닥을 바닥에 밀착시키고 단단히 고정합니다.',
          '날개뼈(견갑골)를 모아 벤치에 고정하여 가슴이 충분히 열리게 합니다.',
          '바벨을 어깨 너비보다 넓게 잡고 랙에서 천천히 들어올립니다.',
          '숨을 들이쉬며 가슴 중앙선(유두선)을 향해 통제력을 유지하며 내립니다.',
          '바벨이 가슴에 살짝 닿는 시점에 가슴 근육의 힘으로 수직 방향으로 강하게 밀어올립니다.'
        ],
        precautions: [
          '손목이 뒤로 꺾이지 않도록 바벨을 손바닥 아래 뼈 쪽에 얹어야 합니다.',
          '어깨 충돌을 방지하기 위해 팔꿈치가 위로 들리지 않게 각도를 약 70도 아래로 설정하세요.'
        ],
        equipment: [
          { name: '올림픽 플랫 벤치', desc: '흔들림 없는 견고한 철제 가죽 패드 벤치', type: 'bench' },
          { name: '20kg 탄력 바벨', desc: '크롬 합금강으로 제작된 표준 바벨 바', type: 'barbell' },
          { name: '우레탄 플레이트', desc: '소음 방지와 정확한 수평 배분을 위한 원판', type: 'plates' }
        ]
      },
      'squat': {
        coachComment: '하체 운동의 절대적인 왕입니다! 대퇴사두근과 둔근 뿐 아니라 전신 코어 근력과 협응력을 폭발적으로 끌어올립니다.',
        instructions: [
          '바벨을 승모근 상부에 견착하고 어깨 너비보다 넓게 잡아 랙에서 조심스럽게 꺼냅니다.',
          '양발은 어깨 너비로 벌리고, 발끝은 약 15~30도 가량 바깥쪽을 향하게 합니다.',
          '골반(고관절)을 접고 엉덩이를 뒤로 빼면서 무릎을 굽혀 주저앉습니다.',
          '허벅지가 바닥과 최소 평행이 되는 지점까지 내려가되 척추 각도를 중립으로 세웁니다.',
          '발가락이 아닌 발뒤꿈치와 발바닥 전체로 지면을 강하게 밀며 일어섭니다.'
        ],
        precautions: [
          '내려갈 때 골반이 심하게 아래로 말리는 벗윙크(Butt-wink) 현상이 나오면 깊이를 유연성에 맞추어 제한하세요.',
          '무릎이 안쪽으로 모이지 않도록 계속 허벅지 외측 근력을 유지하세요.'
        ],
        equipment: [
          { name: '견고한 파워 랙', desc: '안전 바가 설치된 전신 스쿼트 전용 프레임', type: 'machine' },
          { name: '하중 분산 바벨', desc: '안전한 견착을 위한 널링 탄력 강철 바', type: 'barbell' },
          { name: '스쿼트 플랫 슈즈', desc: '지면 밀착력을 높여주는 평평하고 단단한 신발', type: 'plates' }
        ]
      },
      'deadlift': {
        coachComment: '후면 사슬 근육 전체를 동시에 자극하는 완벽한 전신 운동입니다. 척추의 단단한 통제와 코어 개입이 필수적입니다.',
        instructions: [
          '바벨 바가 발 중앙(정강이 2~3cm 앞)에 오도록 바짝 다가서서 골반 너비로 섭니다.',
          '힙 힌지(고관절 접기)를 사용해 상체를 숙이며 정강이를 밀착시키고 어깨너비로 바벨을 움켜잡습니다.',
          '가슴을 열어 허리를 반듯하게 펴고, 광배근을 긴장시켜 바벨을 몸 안쪽으로 당겨 놓습니다.',
          '다리로 지면을 먼저 밀어올린 다음 고관절을 완전히 펴서 수직으로 상체를 세웁니다.',
          '바가 허벅지와 무릎을 스치듯 밀착시켜 안전하게 내립니다.'
        ],
        precautions: [
          '동작 중 등과 허리가 고양이처럼 구부러지는 경우 척추에 심각한 충격이 가니 세팅을 반드시 재검토해야 합니다.',
          '과도하게 뒤로 상체를 제치는 오버 익스텐션은 요추 요통을 유발합니다.'
        ],
        equipment: [
          { name: '리프팅 플랫폼', desc: '미끄럼 없는 지반 지지력과 소음 감쇄를 주는 바닥 고무판', type: 'bench' },
          { name: '고하중 베어링 바', desc: '회전성이 좋아 고하중도 손목 충격 없이 뽑아내는 고장력 바', type: 'barbell' },
          { name: '가죽 리프팅 벨트', desc: '복압을 증가시켜 요추 부담을 현저히 낮추는 보호 장구', type: 'plates' }
        ]
      },
      'lat-pulldown': {
        coachComment: '넓고 입체적인 프레임의 등을 만들기 위한 광배근 표적 운동입니다. 날개뼈의 회전 상하 움직임을 느끼며 수축하세요.',
        instructions: [
          '패드에 허벅지를 밀착시키고 발을 바닥에 놓은 후 고정 장치를 조절합니다.',
          '어깨너비보다 1.5배 넓게 오버핸드 그립으로 바를 단단히 쥡니다.',
          '가슴을 위로 향하게 살짝 열고 척추를 세운 후 상체를 미세하게 뒤로 눕힙니다.',
          '팔꿈치로 뒤 주머니를 찌른다는 느낌으로 바를 쇄골 아랫부분으로 끌어 내립니다.',
          '광배근의 긴장을 끝까지 붙잡으며 저항감을 느끼며 바를 서서히 위로 되돌려 보냅니다.'
        ],
        precautions: [
          '팔의 힘으로 억지로 잡아당기면 이두근만 과도하게 쓰이고 등에 제대로 자극이 전달되지 않습니다.',
          '바를 내릴 때 반동을 심하게 쓰며 허리를 꺾지 마세요.'
        ],
        equipment: [
          { name: '풀리 케이블 머신', desc: '정밀하고 끊김 없는 웨이트 블록 풀리 타워', type: 'machine' },
          { name: '와이드 랫 바', desc: '최적의 광배근 고립을 설계한 전용 곡선 바', type: 'barbell' },
          { name: '허벅지 롤러 패드', desc: '몸이 위로 끌려 올라가는 것을 강력히 방지하는 고밀도 폼 패드', type: 'bench' }
        ]
      }
    };

    const fallback: Record<ExerciseCategory, typeof guides[keyof typeof guides]> = {
      '가슴': {
        coachComment: '가슴 근육(대흉근) 전반의 볼륨을 채우는 데 최적의 훈련입니다. 항상 어깨 안정성을 확보하고 수행하세요.',
        instructions: [
          '벤치 혹은 안장에 안정되게 착석/체공합니다.',
          '견갑골을 통제하여 가슴 근육의 신장 수축 공간을 확보합니다.',
          '중량을 통제하여 가슴 중심으로 밀어 올리거나 안쪽으로 모읍니다.',
          '최대 수축 지점에서 가슴에 지속적인 긴장을 줍니다.'
        ],
        precautions: [
          '어깨 관절이 과회전되거나 가슴보다 앞서지 않게 중량을 세팅하세요.'
        ],
        equipment: [
          { name: '프레스 전용 하드웨어', desc: '관절 궤적을 제어해 안전성을 키운 프레스 장비', type: 'machine' },
          { name: '프로 트레이닝 덤벨', desc: '세밀한 회전 궤적으로 고립을 강화하는 프리웨이트 기구', type: 'dumbbell' },
          { name: '서포트 패드 벤치', desc: '가슴 열림 각도를 조절할 수 있는 다각도 가죽 인클라인 벤치', type: 'bench' }
        ]
      },
      '등': {
        coachComment: '등 전체의 두께와 넓이를 동시에 발달시키는 당기기 동작입니다. 승모근 개입을 줄이고 광배를 메인으로 끌어쓰세요.',
        instructions: [
          '타겟 그립으로 기구를 잡고 허리와 척추를 세웁니다.',
          '날개뼈를 뒤로 모으면서 팔꿈치를 뒤로 길게 당겨 등 근육을 수축합니다.',
          '몸통이 흔들리지 않도록 복근과 둔근에 힘을 주며 버팁니다.',
          '신장성 수축을 느끼며 부드럽게 팔을 펴서 등 근육을 늘립니다.'
        ],
        precautions: [
          '수축 시 어깨가 으쓱하고 솟구치지 않도록 어깨를 아래로 낮춘 상태를 지키세요.'
        ],
        equipment: [
          { name: '안정형 케이블 시스템', desc: '다양한 어태치먼트를 호환하는 저항 케이블 도구', type: 'machine' },
          { name: '우레탄 플레이트 바벨', desc: '두꺼운 등을 장악하는 최고 중량 단련 프리웨이트 바', type: 'barbell' },
          { name: '가죽 그립 스트랩', desc: '악력 부족으로 인해 운동이 중도 하차하지 않게 돕는 특수 스트랩', type: 'plates' }
        ]
      },
      '하체': {
        coachComment: '강인한 하체는 기초 대사량 상승과 전신 근력 균형의 토대입니다. 발바닥 접지를 완벽하게 유지하세요.',
        instructions: [
          '골반 넓이에 어울리게 스탠스를 정하고 몸의 균형을 안정시킵니다.',
          '고관절 힌지 메커니즘을 적용하여 엉덩이와 허벅지의 저항을 흡수하며 굽힙니다.',
          '발바닥 삼각지점(엄지, 소지, 뒤꿈치)에 힘을 고르게 싣고 지면을 강력히 밀어 폅니다.',
          '허리가 요동치지 않도록 코어를 끝까지 유지하세요.'
        ],
        precautions: [
          '무릎 관절이 발 끝에 비해 지나치게 튀어나와 슬개골에 마찰 스트레스가 집중되지 않도록 조절하십시오.'
        ],
        equipment: [
          { name: '강철 하프 랙', desc: '자유도 높은 중량 하체 스쿼트를 보좌하는 다목적 안전 하프 랙', type: 'machine' },
          { name: '초정밀 널링 탄력봉', desc: '견착 시 미끄러짐을 최소화하는 하이엔드 탄소강 탄력봉', type: 'barbell' },
          { name: '고강성 발 지지대', desc: '정확한 가압 중심을 느끼게 설계된 고무 마찰 매트 플랫폼', type: 'plates' }
        ]
      },
      '어깨': {
        coachComment: '어깨 라인을 둥글고 강하게 입체적으로 가꾸어 줍니다. 회전근개 부상을 항시 유의하고 저중량 고반복부터 세팅하세요.',
        instructions: [
          '바벨 혹은 덤벨을 들고 상체를 반듯하게 고정합니다.',
          '어깨 삼각근의 결과 평행하게 중량을 밀거나 옆으로 벌려 던지듯 올립니다.',
          '내릴 때는 어깨 저항을 온전히 느끼며 서서히 내립니다.',
          '목 승모근에 과도한 힘이 누수되지 않도록 어깨를 바닥으로 고정시킵니다.'
        ],
        precautions: [
          '프레스 진행 시 전완(팔뚝) 각도가 바닥과 항상 수직을 유지해야 회전근개 관절이 다치지 않습니다.'
        ],
        equipment: [
          { name: '프로페셔널 세트 덤벨', desc: '어깨 삼각근을 정밀 분할 타격할 수 있는 원피스 크롬 덤벨 세트', type: 'dumbbell' },
          { name: '하이백 프레스 벤치', desc: '허리 꺾임을 완화하고 견고한 밀기를 보장하는 고각 벤치', type: 'bench' },
          { name: '케이블 풀다운 노즐', desc: '측후면 삼각근을 정적 장력으로 고립하는 가벼운 노즐', type: 'machine' }
        ]
      },
      '팔': {
        coachComment: '이두근과 삼두근의 균형 있는 발달은 팔을 더욱 크고 선명하게 만듭니다. 팔꿈치를 옆구리에 완전 밀착 고정하세요.',
        instructions: [
          '팔꿈치를 옆구리 쪽에 단단히 세팅하여 지렛대 지점을 단단히 만듭니다.',
          '팔을 접거나 펴서 이두 및 삼두 근육을 한계까지 강하게 쥐어짜줍니다.',
          '동작 진행 중 어깨가 들썩이거나 상체가 앞뒤로 흔들리는 반동(치팅)을 막으세요.',
          '근육을 늘릴 때도 툭 떨어트리지 않고 힘을 꽉 쥐며 유도합니다.'
        ],
        precautions: [
          '과도한 무게를 쓰다 팔꿈치 건염이 자주 유발되니 수축감이 집중되는 알맞은 하중으로 반복하세요.'
        ],
        equipment: [
          { name: 'EZ-바벨 바', desc: '손목 스트레스를 줄이기 위해 W자 곡선 가공된 팔 운동 전용 이지바', type: 'barbell' },
          { name: '인체공학 팔 거치대', desc: '상완을 완전히 강제 고립시켜 치팅을 일절 차단하는 프리처 벤치 패드', type: 'bench' },
          { name: '고중량 일체형 아령', desc: '정교한 무게 배분으로 그립 수축 피드백이 뛰어난 덤벨 기재', type: 'dumbbell' }
        ]
      },
      '복근': {
        coachComment: '코어의 중심입니다. 척추의 움직임을 동그랗게 둥글려서 복직근에 완벽한 압박 텐션을 유발하세요.',
        instructions: [
          '매트에 편안히 눕거나 기구에 상체를 견착합니다.',
          '단순히 허리를 꺾는 게 아니라 등을 둥글게 말아 가슴과 치골뼈를 가깝게 좁힙니다.',
          '최대 수축 시 숨을 완전히 내쉬어 복강의 공간을 차단해 깊은 수축을 유도합니다.',
          '시선은 배꼽 방향을 자연스레 따라가 목 피로도를 줄입니다.'
        ],
        precautions: [
          '허리가 과하게 바닥에서 들리는 상태로 다리를 올리거나 내리면 척추에 강한 젖힘 통증이 옵니다.'
        ],
        equipment: [
          { name: '프리미엄 요가 매트', desc: '쿠션감이 풍부해 척추와 관절 통증을 줄여주는 무독성 매트', type: 'bench' },
          { name: '코어 슬라이드 휠', desc: '코어 전체의 고정 정적 밸런스를 강화하는 슬라이딩 휠 기구', type: 'plates' },
          { name: '중량 조절 메디신 볼', desc: '수축 부하 가중치를 늘려 복직근에 더 큰 손상을 누적하는 중량 공', type: 'dumbbell' }
        ]
      },
      '유산소': {
        coachComment: '심폐 능력과 지구력 향상, 그리고 체지방 연소의 최고 효율 지점입니다. 일정한 페이스와 규칙적인 호흡을 유지하세요.',
        instructions: [
          '운동 기구의 대시보드를 세팅하고 정방형 자세로 올라섭니다.',
          '무릎 관절에 오는 임팩트를 줄이기 위해 착지 시 발뒤꿈치부터 사뿐히 닿게 유도합니다.',
          '골반을 반듯하게 정렬하고 시선은 15m 전방을 내다보며 척추를 똑바로 유지합니다.',
          '일정한 심박수 구역(Zone 2~3)에 맞춰 목표 시간 동안 쉬지 않고 수행합니다.'
        ],
        precautions: [
          '과하게 발목을 구부리거나 피로가 높은 발가락 끝으로 뛰면 아킬레스건 부상이 생깁니다.'
        ],
        equipment: [
          { name: '인클라인 트레드밀', desc: '경사도 조절과 저소음 전동 러닝 구동용 러닝머신', type: 'treadmill' },
          { name: '자석 유도 저항 자전거', desc: '무소음 마그네틱 플라이휠 설계의 고정 실내 바이크', type: 'machine' },
          { name: '천국의 계단 머신', desc: '최고 속도 칼로리 버닝을 위해 스텝을 무한 순환하는 프리미엄 유산소 클라이머', type: 'machine' }
        ]
      },
      '전신': {
        coachComment: '전신을 한번에 동원하는 대규모 전신 협응 코스입니다. 균형 유지와 순발력 제어에 집중하세요.',
        instructions: [
          '서거나 준비 상태를 구축하고 무게 중심을 몸 중앙에 잡아둡니다.',
          '순발력 있게 몸 전체의 고관절, 무릎, 어깨 라인을 역동적으로 가동시킵니다.',
          '숨을 들이켜 코어 안정을 확실히 잠근 채 운동 흐름을 끊김 없이 결속시킵니다.',
          '피로로 인해 특정 부위에 무리가 오지 않는지 지속 모니터링 하십시오.'
        ],
        precautions: [
          '반동이 격해질 때 척추나 어깨 견갑 지지 구조가 무너지면 심한 타박성 상해를 유발할 수 있습니다.'
        ],
        equipment: [
          { name: '카본 탄력 바벨 세트', desc: '역동적인 동작 전환 스트레스를 견뎌내는 카본 강화 리프팅 봉 세트', type: 'barbell' },
          { name: '인체공학적 무쇠 아령', desc: '순발력 넘치는 스내치나 클린 동작 수행에 유용한 통무쇠 아령', type: 'dumbbell' },
          { name: '고장력 탄성 밴드', desc: '운동 범위가 깊어질수록 저항 부하가 연속 가중되는 러버 밴드', type: 'plates' }
        ]
      }
    };

    return guides[id] || fallback[exercise.category] || fallback['전신'];
  };

  const guideData = getExerciseGuideData();

  // 3D Skeleton joint coordinates generation
  const getSkeletonJoints = (): { joints: Record<string, Point3D>; lines: [string, string][]; muscleJoints: string[] } => {
    const id = exercise.id;
    const cat = exercise.category;
    const s = (Math.sin(time) + 1) / 2; // Oscillation ratio (0 to 1)

    // Detailed Exercise checks based on exact ID or name patterns
    const isSquatEx = id === 'squat' || exercise.name.includes('스쿼트');
    const isLegPressEx = id === 'leg-press' || exercise.name.includes('레그 프레스');
    const isLegExtensionEx = id === 'leg-extension' || exercise.name.includes('익스텐션');
    const isLegCurlEx = id === 'leg-curl' || exercise.name.includes('레그 컬');
    const isLungeEx = id === 'lunge' || exercise.name.includes('런지');
    
    const isBenchPressEx = id === 'bench-press' || id === 'incline-bench-press' || exercise.name.includes('벤치 프레스');
    const isDumbbellPressEx = id === 'dumbbell-press' || id === 'incline-dumbbell-press' || (exercise.name.includes('덤벨') && exercise.name.includes('프레스') && cat === '가슴');
    const isPushUpEx = id === 'push-up' || exercise.name.includes('푸쉬업') || exercise.name.includes('팔굽혀펴기');
    const isChestFlyEx = id === 'chest-fly-machine' || id === 'cable-crossover' || exercise.name.includes('플라이') || exercise.name.includes('크로스오버');

    const isDeadliftEx = id === 'deadlift' || id === 'romanian-deadlift' || exercise.name.includes('데드리프트');
    const isPullUpEx = id === 'pull-up' || exercise.name.includes('풀업') || exercise.name.includes('턱걸이');
    const isLatPulldownEx = id === 'lat-pulldown' || exercise.name.includes('랫 풀');
    const isRowEx = id === 'barbell-row' || id === 'dumbbell-row' || id === 'seated-row-machine' || exercise.name.includes('로우');

    const isOverheadEx = id === 'overhead-press' || id === 'dumbbell-shoulder-press' || exercise.name.includes('숄더 프레스') || exercise.name.includes('오버헤드 프레스');
    const isLateralRaiseEx = id === 'side-lateral-raise' || id === 'bent-over-lateral-raise' || id === 'front-raise' || exercise.name.includes('레이즈');

    const isCurlEx = id === 'barbell-curl' || id === 'dumbbell-curl' || id === 'hammer-curl' || exercise.name.includes('컬');
    const isTricepsEx = id === 'triceps-pushdown-cable' || id === 'lying-triceps-extension' || exercise.name.includes('트라이셉스') || exercise.name.includes('푸쉬다운') || exercise.name.includes('삼두');

    const isCrunchEx = id === 'crunch' || exercise.name.includes('크런치');
    const isLegRaiseEx = id === 'leg-raise' || exercise.name.includes('레그 레이즈');
    const isPlankEx = id === 'plank' || exercise.name.includes('플랭크');

    const isRunningEx = id === 'running' || exercise.name.includes('러닝') || exercise.name.includes('트레드밀');
    const isCyclingEx = id === 'cycling' || exercise.name.includes('자전거') || exercise.name.includes('사이클');
    const isStairClimberEx = id === 'stair-climber' || exercise.name.includes('계단') || exercise.name.includes('스텝밀');

    if (isSquatEx) {
      // 1. Squat Model
      const squatDepth = 32 * s;
      const kneeY = 22 * s;
      const kneeZ = 27 - 12 * s;
      const hipZ = 55 - squatDepth;
      const hipY = 15 * s;

      return {
        joints: {
          'head': { x: 0, y: hipY - 5, z: 105 - squatDepth },
          'shoulder_l': { x: -16, y: hipY - 3, z: 90 - squatDepth },
          'shoulder_r': { x: 16, y: hipY - 3, z: 90 - squatDepth },
          'hip_l': { x: -12, y: hipY, z: hipZ },
          'hip_r': { x: 12, y: hipY, z: hipZ },
          'knee_l': { x: -15, y: 15 + kneeY, z: kneeZ },
          'knee_r': { x: 15, y: 15 + kneeY, z: kneeZ },
          'foot_l': { x: -15, y: 15, z: 0 },
          'foot_r': { x: 15, y: 15, z: 0 },
          'hand_l': { x: -18, y: hipY - 4, z: 90 - squatDepth },
          'hand_r': { x: 18, y: hipY - 4, z: 90 - squatDepth },
          'barbell_l': { x: -45, y: hipY - 6, z: 92 - squatDepth },
          'barbell_r': { x: 45, y: hipY - 6, z: 92 - squatDepth }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r'],
          ['barbell_l', 'barbell_r']
        ],
        muscleJoints: ['hip_l', 'knee_l', 'hip_r', 'knee_r'] // Quads & Glutes glow
      };
    } else if (isLegPressEx) {
      // 2. Leg Press Model
      const pressRatio = 25 * s;
      return {
        joints: {
          'head': { x: 0, y: -45, z: 45 },
          'shoulder_l': { x: -14, y: -35, z: 35 },
          'shoulder_r': { x: 14, y: -35, z: 35 },
          'hip_l': { x: -11, y: 15, z: 10 },
          'hip_r': { x: 11, y: 15, z: 10 },
          'knee_l': { x: -15, y: 22 - pressRatio * 0.3, z: 12 + pressRatio * 0.4 },
          'knee_r': { x: 15, y: 22 - pressRatio * 0.3, z: 12 + pressRatio * 0.4 },
          'foot_l': { x: -14, y: 35 + pressRatio * 0.7, z: 15 + pressRatio * 0.7 },
          'foot_r': { x: 14, y: 35 + pressRatio * 0.7, z: 15 + pressRatio * 0.7 },
          'barbell_l': { x: -28, y: 35 + pressRatio * 0.7, z: 15 + pressRatio * 0.7 },
          'barbell_r': { x: 28, y: 35 + pressRatio * 0.7, z: 15 + pressRatio * 0.7 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['barbell_l', 'barbell_r']
        ],
        muscleJoints: ['hip_l', 'knee_l', 'hip_r', 'knee_r']
      };
    } else if (isLegExtensionEx) {
      // 3. Leg Extension
      const extAngle = (Math.PI / 2) * s;
      return {
        joints: {
          'head': { x: 0, y: 0, z: 80 },
          'shoulder_l': { x: -13, y: 3, z: 65 },
          'shoulder_r': { x: 13, y: 3, z: 65 },
          'hip_l': { x: -12, y: 15, z: 30 },
          'hip_r': { x: 12, y: 15, z: 30 },
          'knee_l': { x: -13, y: 35, z: 30 },
          'knee_r': { x: 13, y: 35, z: 30 },
          'foot_l': { x: -13, y: 35 + 22 * Math.sin(extAngle), z: 30 - 22 * Math.cos(extAngle) },
          'foot_r': { x: 13, y: 35 + 22 * Math.sin(extAngle), z: 30 - 22 * Math.cos(extAngle) },
          'hand_l': { x: -18, y: 12, z: 28 },
          'hand_r': { x: 18, y: 12, z: 28 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['hip_l', 'hand_l'],
          ['hip_r', 'hand_r']
        ],
        muscleJoints: ['knee_l', 'foot_l', 'knee_r', 'foot_r']
      };
    } else if (isLegCurlEx) {
      // 4. Prone Leg Curl
      const curlAngle = (Math.PI / 2.2) * s;
      return {
        joints: {
          'head': { x: 0, y: -45, z: 18 },
          'shoulder_l': { x: -13, y: -30, z: 12 },
          'shoulder_r': { x: 13, y: -30, z: 12 },
          'hip_l': { x: -11, y: 15, z: 10 },
          'hip_r': { x: 11, y: 15, z: 10 },
          'knee_l': { x: -13, y: 40, z: 10 },
          'knee_r': { x: 13, y: 40, z: 10 },
          'foot_l': { x: -13, y: 40 - 20 * Math.sin(curlAngle), z: 10 + 20 * Math.cos(curlAngle) },
          'foot_r': { x: 13, y: 40 - 20 * Math.sin(curlAngle), z: 10 + 20 * Math.cos(curlAngle) }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r']
        ],
        muscleJoints: ['knee_l', 'foot_l', 'knee_r', 'foot_r']
      };
    } else if (isLungeEx) {
      // 5. Lunge Model
      const lungeDepth = 25 * s;
      return {
        joints: {
          'head': { x: 0, y: 2, z: 100 - lungeDepth },
          'shoulder_l': { x: -15, y: 2, z: 85 - lungeDepth },
          'shoulder_r': { x: 15, y: 2, z: 85 - lungeDepth },
          'hip_l': { x: -12, y: 2, z: 50 - lungeDepth },
          'hip_r': { x: 12, y: 2, z: 50 - lungeDepth },
          'knee_l': { x: -12, y: 25, z: Math.max(0, 25 - lungeDepth) },
          'foot_l': { x: -12, y: 25, z: 0 },
          'knee_r': { x: 12, y: -20, z: Math.max(2, 25 - lungeDepth) },
          'foot_r': { x: 12, y: -35, z: 0 },
          'hand_l': { x: -18, y: 2, z: 65 - lungeDepth },
          'hand_r': { x: 18, y: 2, z: 65 - lungeDepth }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['knee_l', 'foot_l'],
          ['hip_r', 'knee_r'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r']
        ],
        muscleJoints: ['hip_l', 'knee_l', 'hip_r', 'knee_r']
      };
    } else if (isBenchPressEx || isDumbbellPressEx) {
      // 6. Bench Press Model
      const barZ = 65 + 35 * s;
      const elbowZ = 28 + 12 * s;
      const elbowXOffset = 26 + 10 * (1 - s);

      const jointsObj: Record<string, Point3D> = {
        'head': { x: 0, y: -65, z: 25 },
        'shoulder_l': { x: -16, y: -35, z: 25 },
        'shoulder_r': { x: 16, y: -35, z: 25 },
        'hip_l': { x: -10, y: 35, z: 25 },
        'hip_r': { x: 10, y: 35, z: 25 },
        'knee_l': { x: -18, y: 55, z: 5 },
        'knee_r': { x: 18, y: 55, z: 5 },
        'foot_l': { x: -18, y: 55, z: -25 },
        'foot_r': { x: 18, y: 55, z: -25 },
        'hand_l': { x: -18, y: -35, z: barZ },
        'hand_r': { x: 18, y: -35, z: barZ },
        'elbow_l': { x: -elbowXOffset, y: -35, z: elbowZ },
        'elbow_r': { x: elbowXOffset, y: -35, z: elbowZ }
      };

      if (!isDumbbellPressEx) {
        jointsObj['barbell_l'] = { x: -48, y: -35, z: barZ };
        jointsObj['barbell_r'] = { x: 48, y: -35, z: barZ };
      }

      return {
        joints: jointsObj,
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ...(!isDumbbellPressEx ? [['barbell_l', 'barbell_r'] as [string, string]] : [])
        ],
        muscleJoints: ['shoulder_l', 'shoulder_r', 'elbow_l', 'elbow_r']
      };
    } else if (isPushUpEx) {
      // 7. Push-up Model
      const pushRatio = 14 * s;
      return {
        joints: {
          'head': { x: 0, y: -45, z: 16 + pushRatio },
          'shoulder_l': { x: -15, y: -30, z: 12 + pushRatio },
          'shoulder_r': { x: 15, y: -30, z: 12 + pushRatio },
          'hip_l': { x: -10, y: 25, z: 8 + pushRatio * 0.7 },
          'hip_r': { x: 10, y: 25, z: 8 + pushRatio * 0.7 },
          'knee_l': { x: -11, y: 55, z: 4 + pushRatio * 0.4 },
          'knee_r': { x: 11, y: 55, z: 4 + pushRatio * 0.4 },
          'foot_l': { x: -10, y: 75, z: 0 },
          'foot_r': { x: 10, y: 75, z: 0 },
          'hand_l': { x: -18, y: -30, z: 0 },
          'hand_r': { x: 18, y: -30, z: 0 },
          'elbow_l': { x: -22 - 6 * (1 - s), y: -30, z: Math.max(0, pushRatio * 0.5) },
          'elbow_r': { x: 22 + 6 * (1 - s), y: -30, z: Math.max(0, pushRatio * 0.5) }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'shoulder_r', 'elbow_l', 'elbow_r']
      };
    } else if (isChestFlyEx) {
      // 8. Chest Fly / Cable Crossover
      const flyAngle = Math.PI / 4 + (Math.PI / 3) * (1 - s);
      const handX = 18 * Math.cos(flyAngle) + 12;
      const handY = -18 * Math.sin(flyAngle);
      return {
        joints: {
          'head': { x: 0, y: 0, z: 110 },
          'shoulder_l': { x: -16, y: 0, z: 92 },
          'shoulder_r': { x: 16, y: 0, z: 92 },
          'hip_l': { x: -12, y: 0, z: 55 },
          'hip_r': { x: 12, y: 0, z: 55 },
          'knee_l': { x: -13, y: 0, z: 27 },
          'knee_r': { x: 13, y: 0, z: 27 },
          'foot_l': { x: -13, y: 0, z: 0 },
          'foot_r': { x: 13, y: 0, z: 0 },
          'elbow_l': { x: -16 - 15 * Math.cos(flyAngle * 0.8), y: -15 * Math.sin(flyAngle * 0.8), z: 92 },
          'elbow_r': { x: 16 + 15 * Math.cos(flyAngle * 0.8), y: -15 * Math.sin(flyAngle * 0.8), z: 92 },
          'hand_l': { x: -16 - handX, y: handY, z: 92 },
          'hand_r': { x: 16 + handX, y: handY, z: 92 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'elbow_l', 'shoulder_r', 'elbow_r']
      };
    } else if (isDeadliftEx) {
      // 9. Deadlift / Romanian Deadlift
      const liftRatio = s;
      const torsoTilt = 45 * (1 - liftRatio);
      const barZ = 15 + 45 * liftRatio;
      const spineZ = 100 - 35 * (1 - liftRatio);
      const spineY = 22 * (1 - liftRatio);

      return {
        joints: {
          'head': { x: 0, y: spineY + 6, z: spineZ + 15 },
          'shoulder_l': { x: -15, y: spineY, z: spineZ },
          'shoulder_r': { x: 15, y: spineY, z: spineZ },
          'hip_l': { x: -12, y: -8 * (1 - liftRatio), z: 55 - 15 * (1 - liftRatio) },
          'hip_r': { x: 12, y: -8 * (1 - liftRatio), z: 55 - 15 * (1 - liftRatio) },
          'knee_l': { x: -14, y: 12 * (1 - liftRatio), z: 30 - 8 * (1 - liftRatio) },
          'knee_r': { x: 14, y: 12 * (1 - liftRatio), z: 30 - 8 * (1 - liftRatio) },
          'foot_l': { x: -14, y: 10, z: 0 },
          'foot_r': { x: 14, y: 10, z: 0 },
          'hand_l': { x: -17, y: spineY, z: barZ },
          'hand_r': { x: 17, y: spineY, z: barZ },
          'barbell_l': { x: -48, y: spineY, z: barZ },
          'barbell_r': { x: 48, y: spineY, z: barZ }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r'],
          ['barbell_l', 'barbell_r']
        ],
        muscleJoints: ['hip_l', 'shoulder_l', 'hip_r', 'shoulder_r']
      };
    } else if (isPullUpEx) {
      // 10. Pull-up Model
      const pullRatio = 32 * s;
      return {
        joints: {
          'head': { x: 0, y: -2, z: 85 + pullRatio },
          'shoulder_l': { x: -16, y: -2, z: 70 + pullRatio },
          'shoulder_r': { x: 16, y: -2, z: 70 + pullRatio },
          'hip_l': { x: -12, y: 0, z: 35 + pullRatio },
          'hip_r': { x: 12, y: 0, z: 35 + pullRatio },
          'knee_l': { x: -13, y: -10, z: 12 + pullRatio },
          'knee_r': { x: 13, y: -10, z: 12 + pullRatio },
          'foot_l': { x: -12, y: -15, z: -10 + pullRatio },
          'foot_r': { x: 12, y: -15, z: -10 + pullRatio },
          'hand_l': { x: -25, y: 0, z: 120 },
          'hand_r': { x: 25, y: 0, z: 120 },
          'elbow_l': { x: -28 + 6 * s, y: -4, z: 95 + pullRatio * 0.3 },
          'elbow_r': { x: 28 - 6 * s, y: -4, z: 95 + pullRatio * 0.3 },
          'barbell_l': { x: -48, y: 0, z: 122 },
          'barbell_r': { x: 48, y: 0, z: 122 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ['barbell_l', 'barbell_r']
        ],
        muscleJoints: ['shoulder_l', 'hip_l', 'shoulder_r', 'hip_r']
      };
    } else if (isLatPulldownEx) {
      // 11. Lat Pulldown Model
      const barZ = 125 - 40 * s;
      const elbowZ = 100 - 38 * s;
      const elbowX = 22 - 6 * s;

      return {
        joints: {
          'head': { x: 0, y: -6, z: 95 },
          'shoulder_l': { x: -16, y: -5, z: 80 },
          'shoulder_r': { x: 16, y: -5, z: 80 },
          'hip_l': { x: -12, y: 0, z: 30 },
          'hip_r': { x: 12, y: 0, z: 30 },
          'knee_l': { x: -14, y: 25, z: 32 },
          'knee_r': { x: 14, y: 25, z: 32 },
          'foot_l': { x: -14, y: 25, z: -10 },
          'foot_r': { x: 14, y: 25, z: -10 },
          'hand_l': { x: -24, y: -5, z: barZ },
          'hand_r': { x: 24, y: -5, z: barZ },
          'elbow_l': { x: -elbowX, y: -8, z: elbowZ },
          'elbow_r': { x: elbowX, y: -8, z: elbowZ },
          'barbell_l': { x: -48, y: -5, z: barZ + 2 },
          'barbell_r': { x: 48, y: -5, z: barZ + 2 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ['barbell_l', 'barbell_r']
        ],
        muscleJoints: ['shoulder_l', 'hip_l', 'shoulder_r', 'hip_r']
      };
    } else if (isRowEx) {
      // 12. Row Model
      const pullRatio = s;
      const handY = 15 - 28 * pullRatio;
      const handZ = 50 + 8 * pullRatio;
      const elbowY = 18 - 32 * pullRatio;
      const elbowZ = 60 + 10 * pullRatio;

      const jointsObj: Record<string, Point3D> = {
        'head': { x: 0, y: 28, z: 90 },
        'shoulder_l': { x: -15, y: 22, z: 75 },
        'shoulder_r': { x: 15, y: 22, z: 75 },
        'hip_l': { x: -12, y: -10, z: 50 },
        'hip_r': { x: 12, y: -10, z: 50 },
        'knee_l': { x: -14, y: 10, z: 25 },
        'knee_r': { x: 14, y: 10, z: 25 },
        'foot_l': { x: -14, y: 10, z: 0 },
        'foot_r': { x: 14, y: 10, z: 0 },
        'hand_l': { x: -16, y: handY, z: handZ },
        'hand_r': { x: 16, y: handY, z: handZ },
        'elbow_l': { x: -18, y: elbowY, z: elbowZ },
        'elbow_r': { x: 18, y: elbowY, z: elbowZ }
      };

      const isDumbbellRow = id === 'dumbbell-row';
      if (!isDumbbellRow) {
        jointsObj['barbell_l'] = { x: -40, y: handY, z: handZ };
        jointsObj['barbell_r'] = { x: 40, y: handY, z: handZ };
      }

      return {
        joints: jointsObj,
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ...(!isDumbbellRow ? [['barbell_l', 'barbell_r'] as [string, string]] : [])
        ],
        muscleJoints: ['shoulder_l', 'hip_l', 'shoulder_r', 'hip_r']
      };
    } else if (isOverheadEx) {
      // 13. Overhead Press
      const barZ = 90 + 55 * s;
      const elbowZ = 70 + 48 * s;
      const elbowX = 22 - 6 * s;

      const jointsObj: Record<string, Point3D> = {
        'head': { x: 0, y: 0, z: 110 },
        'shoulder_l': { x: -16, y: 0, z: 92 },
        'shoulder_r': { x: 16, y: 0, z: 92 },
        'hip_l': { x: -12, y: 0, z: 55 },
        'hip_r': { x: 12, y: 0, z: 55 },
        'knee_l': { x: -13, y: 0, z: 27 },
        'knee_r': { x: 13, y: 0, z: 27 },
        'foot_l': { x: -13, y: 0, z: 0 },
        'foot_r': { x: 13, y: 0, z: 0 },
        'hand_l': { x: -18, y: 0, z: barZ },
        'hand_r': { x: 18, y: 0, z: barZ },
        'elbow_l': { x: -elbowX, y: 4 * (1 - s), z: elbowZ },
        'elbow_r': { x: elbowX, y: 4 * (1 - s), z: elbowZ }
      };

      const isDumbbellShoulderPress = id === 'dumbbell-shoulder-press';
      if (!isDumbbellShoulderPress) {
        jointsObj['barbell_l'] = { x: -46, y: 0, z: barZ };
        jointsObj['barbell_r'] = { x: 46, y: 0, z: barZ };
      }

      return {
        joints: jointsObj,
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ...(!isDumbbellShoulderPress ? [['barbell_l', 'barbell_r'] as [string, string]] : [])
        ],
        muscleJoints: ['shoulder_l', 'shoulder_r']
      };
    } else if (isLateralRaiseEx) {
      // 14. Side/Front Lateral Raise
      const raiseRatio = s;
      const handX = 15 + 28 * raiseRatio;
      const handZ = 60 + 32 * raiseRatio;
      const elbowX = 15 + 16 * raiseRatio;
      const elbowZ = 75 + 16 * raiseRatio;

      return {
        joints: {
          'head': { x: 0, y: 0, z: 110 },
          'shoulder_l': { x: -15, y: 0, z: 92 },
          'shoulder_r': { x: 15, y: 0, z: 92 },
          'hip_l': { x: -12, y: 0, z: 55 },
          'hip_r': { x: 12, y: 0, z: 55 },
          'knee_l': { x: -13, y: 0, z: 27 },
          'knee_r': { x: 13, y: 0, z: 27 },
          'foot_l': { x: -13, y: 0, z: 0 },
          'foot_r': { x: 13, y: 0, z: 0 },
          'hand_l': { x: -handX, y: 3 * raiseRatio, z: handZ },
          'hand_r': { x: handX, y: 3 * raiseRatio, z: handZ },
          'elbow_l': { x: -elbowX, y: 2 * raiseRatio, z: elbowZ },
          'elbow_r': { x: elbowX, y: 2 * raiseRatio, z: elbowZ }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'elbow_l', 'shoulder_r', 'elbow_r']
      };
    } else if (isCurlEx) {
      // 15. Biceps Curl Model
      const curlRatio = s;
      const handY = 6 * curlRatio;
      const handZ = 45 + 38 * curlRatio;

      const jointsObj: Record<string, Point3D> = {
        'head': { x: 0, y: 0, z: 110 },
        'shoulder_l': { x: -15, y: 0, z: 92 },
        'shoulder_r': { x: 15, y: 0, z: 92 },
        'hip_l': { x: -12, y: 0, z: 55 },
        'hip_r': { x: 12, y: 0, z: 55 },
        'knee_l': { x: -13, y: 0, z: 27 },
        'knee_r': { x: 13, y: 0, z: 27 },
        'foot_l': { x: -13, y: 0, z: 0 },
        'foot_r': { x: 13, y: 0, z: 0 },
        'elbow_l': { x: -15, y: 4, z: 70 },
        'elbow_r': { x: 15, y: 4, z: 70 },
        'hand_l': { x: -15, y: handY, z: handZ },
        'hand_r': { x: 15, y: handY, z: handZ }
      };

      const isDumbbellCurl = id.includes('dumbbell') || exercise.name.includes('덤벨');
      if (!isDumbbellCurl) {
        jointsObj['barbell_l'] = { x: -25, y: handY, z: handZ };
        jointsObj['barbell_r'] = { x: 25, y: handY, z: handZ };
      }

      return {
        joints: jointsObj,
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r'],
          ...(!isDumbbellCurl ? [['barbell_l', 'barbell_r'] as [string, string]] : [])
        ],
        muscleJoints: ['shoulder_l', 'elbow_l', 'shoulder_r', 'elbow_r']
      };
    } else if (isTricepsEx) {
      // 16. Triceps Pushdown / Extension
      const pushRatio = s;
      const handZ = 75 - 35 * pushRatio;
      const handY = 15 + 10 * pushRatio;

      return {
        joints: {
          'head': { x: 0, y: 0, z: 110 },
          'shoulder_l': { x: -15, y: 0, z: 92 },
          'shoulder_r': { x: 15, y: 0, z: 92 },
          'hip_l': { x: -12, y: 0, z: 55 },
          'hip_r': { x: 12, y: 0, z: 55 },
          'knee_l': { x: -13, y: 0, z: 27 },
          'knee_r': { x: 13, y: 0, z: 27 },
          'foot_l': { x: -13, y: 0, z: 0 },
          'foot_r': { x: 13, y: 0, z: 0 },
          'elbow_l': { x: -15, y: 5, z: 72 },
          'elbow_r': { x: 15, y: 5, z: 72 },
          'hand_l': { x: -15, y: handY, z: handZ },
          'hand_r': { x: 15, y: handY, z: handZ }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'elbow_l', 'shoulder_r', 'elbow_r']
      };
    } else if (isCrunchEx) {
      // 17. Crunch / Abs Model
      const crunchRatio = s;
      const crY = -48 + 15 * crunchRatio;
      const crZ = 10 + 20 * crunchRatio;
      const headZ = 12 + 25 * crunchRatio;

      return {
        joints: {
          'head': { x: 0, y: crY - 14, z: headZ },
          'shoulder_l': { x: -14, y: crY, z: crZ },
          'shoulder_r': { x: 14, y: crY, z: crZ },
          'hip_l': { x: -11, y: 15, z: 10 },
          'hip_r': { x: 11, y: 15, z: 10 },
          'knee_l': { x: -15, y: 30, z: 35 },
          'knee_r': { x: 15, y: 30, z: 35 },
          'foot_l': { x: -15, y: 45, z: 5 },
          'foot_r': { x: 15, y: 45, z: 5 },
          'hand_l': { x: -12, y: crY - 8, z: headZ - 2 },
          'hand_r': { x: 12, y: crY - 8, z: headZ - 2 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'hip_l', 'shoulder_r', 'hip_r']
      };
    } else if (isLegRaiseEx) {
      // 18. Leg Raise Model
      const raiseAngle = (Math.PI / 2.2) * s;
      return {
        joints: {
          'head': { x: 0, y: -45, z: 10 },
          'shoulder_l': { x: -14, y: -30, z: 8 },
          'shoulder_r': { x: 14, y: -30, z: 8 },
          'hip_l': { x: -11, y: 15, z: 10 },
          'hip_r': { x: 11, y: 15, z: 10 },
          'knee_l': { x: -12, y: 15 + 24 * Math.cos(raiseAngle), z: 10 + 24 * Math.sin(raiseAngle) },
          'knee_r': { x: 12, y: 15 + 24 * Math.cos(raiseAngle), z: 10 + 24 * Math.sin(raiseAngle) },
          'foot_l': { x: -12, y: 15 + 44 * Math.cos(raiseAngle), z: 10 + 44 * Math.sin(raiseAngle) },
          'foot_r': { x: 12, y: 15 + 44 * Math.cos(raiseAngle), z: 10 + 44 * Math.sin(raiseAngle) },
          'hand_l': { x: -18, y: -10, z: 5 },
          'hand_r': { x: 18, y: -10, z: 5 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['hip_l', 'hand_l'],
          ['hip_r', 'hand_r']
        ],
        muscleJoints: ['hip_l', 'knee_l', 'hip_r', 'knee_r']
      };
    } else if (isPlankEx) {
      // 19. Plank Model
      const vibe = 0.5 * Math.sin(time * 10);
      return {
        joints: {
          'head': { x: 0, y: -50, z: 22 + vibe },
          'shoulder_l': { x: -15, y: -40, z: 18 + vibe },
          'shoulder_r': { x: 15, y: -40, z: 18 + vibe },
          'hip_l': { x: -10, y: 15, z: 17 + vibe },
          'hip_r': { x: 10, y: 15, z: 17 + vibe },
          'knee_l': { x: -11, y: 45, z: 12 + vibe },
          'knee_r': { x: 11, y: 45, z: 12 + vibe },
          'foot_l': { x: -10, y: 70, z: 0 },
          'foot_r': { x: 10, y: 70, z: 0 },
          'elbow_l': { x: -15, y: -40, z: 0 },
          'elbow_r': { x: 15, y: -40, z: 0 },
          'hand_l': { x: -10, y: -50, z: 0 },
          'hand_r': { x: 10, y: -50, z: 0 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'elbow_l'],
          ['elbow_l', 'hand_l'],
          ['shoulder_r', 'elbow_r'],
          ['elbow_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'hip_l', 'shoulder_r', 'hip_r']
      };
    } else if (isRunningEx || isStairClimberEx) {
      // 20. Running/Stair climber Model
      const p1 = time * 2;
      const p2 = time * 2 + Math.PI;
      const bounceZ = 55 + 3.5 * Math.sin(time * 4);

      return {
        joints: {
          'head': { x: 0, y: 0, z: 110 + 3.5 * Math.sin(time * 4) },
          'shoulder_l': { x: -15, y: 0, z: 92 + 3.5 * Math.sin(time * 4) },
          'shoulder_r': { x: 15, y: 0, z: 92 + 3.5 * Math.sin(time * 4) },
          'hip_l': { x: -12, y: 0, z: bounceZ },
          'hip_r': { x: 12, y: 0, z: bounceZ },
          'knee_l': { x: -13, y: 18 * Math.sin(p1), z: bounceZ - 26 + 5 * Math.cos(p1) },
          'knee_r': { x: 13, y: 18 * Math.sin(p2), z: bounceZ - 26 + 5 * Math.cos(p2) },
          'foot_l': { x: -13, y: 26 * Math.sin(p1), z: Math.max(0, 10 * Math.cos(p1)) },
          'foot_r': { x: 13, y: 26 * Math.sin(p2), z: Math.max(0, 10 * Math.cos(p2)) },
          'hand_l': { x: -17, y: 22 * Math.sin(p2), z: 75 },
          'hand_r': { x: 17, y: 22 * Math.sin(p1), z: 75 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r']
        ],
        muscleJoints: ['knee_l', 'foot_l', 'knee_r', 'foot_r']
      };
    } else if (isCyclingEx) {
      // 21. Cycling Model
      const p1 = time * 2;
      const p2 = time * 2 + Math.PI;
      return {
        joints: {
          'head': { x: 0, y: 5, z: 98 },
          'shoulder_l': { x: -14, y: 8, z: 82 },
          'shoulder_r': { x: 14, y: 8, z: 82 },
          'hip_l': { x: -11, y: 0, z: 42 },
          'hip_r': { x: 11, y: 0, z: 42 },
          'knee_l': { x: -13, y: 15 + 6 * Math.sin(p1), z: 24 + 5 * Math.cos(p1) },
          'knee_r': { x: 13, y: 15 + 6 * Math.sin(p2), z: 24 + 5 * Math.cos(p2) },
          'foot_l': { x: -13, y: 18 + 10 * Math.sin(p1), z: 12 + 10 * Math.cos(p1) },
          'foot_r': { x: 13, y: 18 + 10 * Math.sin(p2), z: 12 + 10 * Math.cos(p2) },
          'hand_l': { x: -15, y: 25, z: 78 },
          'hand_r': { x: 15, y: 25, z: 78 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r']
        ],
        muscleJoints: ['knee_l', 'foot_l', 'knee_r', 'foot_r']
      };
    } else {
      // Fallback Full Body model
      const p1 = time * 1.5;
      const p2 = time * 1.5 + Math.PI;
      const bounceZ = 55 + 2 * Math.sin(time * 3);
      return {
        joints: {
          'head': { x: 0, y: 0, z: 110 },
          'shoulder_l': { x: -15, y: 0, z: 92 },
          'shoulder_r': { x: 15, y: 0, z: 92 },
          'hip_l': { x: -12, y: 0, z: bounceZ },
          'hip_r': { x: 12, y: 0, z: bounceZ },
          'knee_l': { x: -13, y: 10 * Math.sin(p1), z: bounceZ - 26 },
          'knee_r': { x: 13, y: 10 * Math.sin(p2), z: bounceZ - 26 },
          'foot_l': { x: -13, y: 12 * Math.sin(p1), z: 0 },
          'foot_r': { x: 13, y: 12 * Math.sin(p2), z: 0 },
          'hand_l': { x: -16, y: 10 * Math.sin(p2), z: 70 },
          'hand_r': { x: 16, y: 10 * Math.sin(p1), z: 70 }
        },
        lines: [
          ['shoulder_l', 'shoulder_r'],
          ['shoulder_l', 'hip_l'],
          ['shoulder_r', 'hip_r'],
          ['hip_l', 'hip_r'],
          ['hip_l', 'knee_l'],
          ['hip_r', 'knee_r'],
          ['knee_l', 'foot_l'],
          ['knee_r', 'foot_r'],
          ['shoulder_l', 'hand_l'],
          ['shoulder_r', 'hand_r']
        ],
        muscleJoints: ['shoulder_l', 'shoulder_r', 'hip_l', 'hip_r']
      };
    }
  };

  const { joints, lines, muscleJoints } = getSkeletonJoints();

  // Project joints list to 2D Screen Space
  const projectedJoints: Record<string, Point2D> = {};
  Object.keys(joints).forEach((key) => {
    projectedJoints[key] = project(joints[key]);
  });

  // Calculate stats from actual user history for this specific exercise
  const getExerciseStats = () => {
    const matchingWorkouts = completedWorkouts.filter(w => 
      w.exercises.some(ex => ex.exerciseId === exercise.id)
    );

    let maxWeight = 0;
    let totalVolume = 0;
    let totalSets = 0;
    const historyPoints: { date: string, weight: number }[] = [];

    // Reverse history to chronologically draw chart
    const cronHistory = [...matchingWorkouts].reverse();

    cronHistory.forEach(workout => {
      const targetEx = workout.exercises.find(ex => ex.exerciseId === exercise.id);
      if (targetEx) {
        let maxWeightInWorkout = 0;
        targetEx.sets.forEach(set => {
          if (set.completed) {
            totalSets++;
            totalVolume += (set.weight * set.reps);
            if (set.weight > maxWeight) maxWeight = set.weight;
            if (set.weight > maxWeightInWorkout) maxWeightInWorkout = set.weight;
          }
        });
        if (maxWeightInWorkout > 0) {
          historyPoints.push({
            date: workout.date.substring(5), // MM-DD
            weight: maxWeightInWorkout
          });
        }
      }
    });

    // Simple 1RM estimate
    // Epley formula: 1RM = weight * (1 + reps / 30)
    // Find the max weight and its reps
    let best1RM = 0;
    matchingWorkouts.forEach(workout => {
      const targetEx = workout.exercises.find(ex => ex.exerciseId === exercise.id);
      if (targetEx) {
        targetEx.sets.forEach(set => {
          if (set.completed && set.weight > 0 && set.reps > 0) {
            const estimated1RM = set.weight * (1 + set.reps / 30);
            if (estimated1RM > best1RM) {
              best1RM = estimated1RM;
            }
          }
        });
      }
    });

    return {
      totalCompletedTimes: matchingWorkouts.length,
      maxWeight,
      estimated1RM: Math.round(best1RM),
      totalVolume,
      totalSets,
      historyPoints,
      matchingWorkouts
    };
  };

  const stats = getExerciseStats();

  // Render SVG mini-diagram for the specialized equipment thumbnails
  const renderEquipmentThumbnail = (type: string) => {
    if (type === 'barbell') {
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
          <line x1="10" y1="30" x2="90" y2="30" stroke="currentColor" strokeWidth="3" />
          <rect x="22" y="15" width="4" height="30" fill="currentColor" rx="1" />
          <rect x="28" y="10" width="6" height="40" fill="currentColor" rx="2" />
          <rect x="74" y="15" width="4" height="30" fill="currentColor" rx="1" />
          <rect x="66" y="10" width="6" height="40" fill="currentColor" rx="2" />
        </svg>
      );
    }
    if (type === 'bench') {
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
          <rect x="15" y="20" width="70" height="8" fill="currentColor" rx="2" />
          <line x1="25" y1="28" x2="20" y2="48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="75" y1="28" x2="80" y2="48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="28" x2="50" y2="48" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    }
    if (type === 'plates') {
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
          <circle cx="50" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="50" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="30" r="4" fill="currentColor" />
          <path d="M 50 8 L 50 15 M 50 45 L 50 52 M 28 30 L 35 30 M 65 30 L 72 30" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    if (type === 'dumbbell') {
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
          <line x1="25" y1="30" x2="75" y2="30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <rect x="25" y="15" width="10" height="30" fill="currentColor" rx="1" />
          <rect x="15" y="18" width="10" height="24" fill="currentColor" rx="1" />
          <rect x="65" y="15" width="10" height="30" fill="currentColor" rx="1" />
          <rect x="75" y="18" width="10" height="24" fill="currentColor" rx="1" />
        </svg>
      );
    }
    if (type === 'treadmill') {
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
          <rect x="15" y="42" width="70" height="6" fill="currentColor" rx="1" />
          <path d="M 25 42 L 35 15 L 55 18 L 65 42" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="35" y1="15" x2="48" y2="15" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    }
    // Default machine icon representation
    return (
      <svg viewBox="0 0 100 60" className="w-12 h-12 text-zinc-400 group-hover:text-brand-neon transition-colors duration-300">
        <rect x="25" y="12" width="10" height="40" fill="currentColor" />
        <rect x="35" y="25" width="25" height="27" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="70" cy="20" r="8" fill="currentColor" />
        <line x1="30" y1="20" x2="70" y2="20" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="exercise-detail-view-container">
      {/* Top Title Bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          id="btn-back-to-list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-black tracking-wide text-brand-neon bg-brand-neon/10 border border-brand-neon/20 px-2.5 py-0.5 rounded-lg uppercase">
            {exercise.category} ∙ GUIDE
          </span>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight italic mt-1 font-display uppercase">
            {exercise.name}
          </h1>
        </div>
      </div>

      {/* Main HUD Display: 3D interactive mannequin */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-3xl p-5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        {/* Glow behind mannequin */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-brand-neon/10 rounded-full blur-[90px] pointer-events-none" />
        
        {/* Interactive canvas / viewport */}
        <div className="w-full md:w-3/5 aspect-[4/3] bg-zinc-950/80 border border-zinc-900 rounded-2xl relative flex items-center justify-center p-3 select-none">
          <svg className="w-full h-full" viewBox="0 0 400 280">
            {/* Tech grid system */}
            <defs>
              <pattern id="hud-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.03" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hud-grid)" rx="12" />

            {/* Visual Calibration rings */}
            <circle cx="200" cy="145" r="110" fill="none" stroke="#C1FF72" strokeWidth="1" strokeDasharray="2,6" strokeOpacity="0.07" />
            <circle cx="200" cy="145" r="75" fill="none" stroke="#C1FF72" strokeWidth="1" strokeOpacity="0.04" />
            
            {/* 3D Floor Grid Projection */}
            <g opacity="0.15">
              {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                const p1 = project({ x: val * 20, y: -80, z: -25 });
                const p2 = project({ x: val * 20, y: 80, z: -25 });
                const q1 = project({ x: -60, y: val * 20, z: -25 });
                const q2 = project({ x: 60, y: val * 20, z: -25 });
                return (
                  <React.Fragment key={val}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#4b5563" strokeWidth="0.75" />
                    <line x1={q1.x} y1={q1.y} x2={q2.x} y2={q2.y} stroke="#4b5563" strokeWidth="0.75" />
                  </React.Fragment>
                );
              })}
            </g>

            {/* Context-specific Equipment Supports (Flat Bench, Incline Bench, Seat, etc.) */}
            {(() => {
              const id = exercise.id;
              const cat = exercise.category;
              const isFlatBench = id === 'bench-press' || id === 'dumbbell-press' || (cat === '가슴' && !id.includes('incline') && id !== 'push-up' && id !== 'cable-crossover' && id !== 'chest-fly-machine');
              const isInclineBench = id === 'incline-bench-press' || id === 'incline-dumbbell-press';
              const isSeat = id === 'lat-pulldown' || id === 'seated-row-machine' || id === 'dumbbell-shoulder-press' || id === 'leg-extension' || id === 'leg-curl';

              if (isFlatBench) {
                const bp1 = project({ x: -14, y: -70, z: 23 });
                const bp2 = project({ x: 14, y: -70, z: 23 });
                const bp3 = project({ x: 14, y: 55, z: 23 });
                const bp4 = project({ x: -14, y: 55, z: 23 });
                const bs1 = project({ x: -14, y: -70, z: 10 });
                const bs2 = project({ x: 14, y: -70, z: 10 });
                const bs3 = project({ x: 14, y: 55, z: 10 });
                const bs4 = project({ x: -14, y: 55, z: 10 });
                return (
                  <g opacity="0.3">
                    {/* Bench Body Top */}
                    <polygon points={`${bp1.x},${bp1.y} ${bp2.x},${bp2.y} ${bp3.x},${bp3.y} ${bp4.x},${bp4.y}`} fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
                    {/* Bench Sides */}
                    <polygon points={`${bp1.x},${bp1.y} ${bp4.x},${bp4.y} ${bs4.x},${bs4.y} ${bs1.x},${bs1.y}`} fill="#18181b" />
                    <polygon points={`${bp3.x},${bp3.y} ${bp4.x},${bp4.y} ${bs4.x},${bs4.y} ${bs3.x},${bs3.y}`} fill="#18181b" />
                  </g>
                );
              }

              if (isInclineBench) {
                const ip1 = project({ x: -13, y: -50, z: 65 });
                const ip2 = project({ x: 13, y: -50, z: 65 });
                const ip3 = project({ x: 13, y: 5, z: 15 });
                const ip4 = project({ x: -13, y: 5, z: 15 });

                const is1 = project({ x: -13, y: 5, z: 15 });
                const is2 = project({ x: 13, y: 5, z: 15 });
                const is3 = project({ x: 13, y: 25, z: 15 });
                const is4 = project({ x: -13, y: 25, z: 15 });
                return (
                  <g opacity="0.35">
                    {/* Incline Backrest */}
                    <polygon points={`${ip1.x},${ip1.y} ${ip2.x},${ip2.y} ${ip3.x},${ip3.y} ${ip4.x},${ip4.y}`} fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
                    {/* Incline Seat */}
                    <polygon points={`${is1.x},${is1.y} ${is2.x},${is2.y} ${is3.x},${is3.y} ${is4.x},${is4.y}`} fill="#18181b" stroke="#27272a" strokeWidth="1" />
                  </g>
                );
              }

              if (isSeat) {
                const sp1 = project({ x: -12, y: 12, z: 90 });
                const sp2 = project({ x: 12, y: 12, z: 90 });
                const sp3 = project({ x: 12, y: 12, z: 30 });
                const sp4 = project({ x: -12, y: 12, z: 30 });

                const ss1 = project({ x: -12, y: 12, z: 30 });
                const ss2 = project({ x: 12, y: 12, z: 30 });
                const ss3 = project({ x: 12, y: 32, z: 30 });
                const ss4 = project({ x: -12, y: 32, z: 30 });
                return (
                  <g opacity="0.35">
                    {/* Seated Backrest */}
                    <polygon points={`${sp1.x},${sp1.y} ${sp2.x},${sp2.y} ${sp3.x},${sp3.y} ${sp4.x},${sp4.y}`} fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
                    {/* Seated Seat */}
                    <polygon points={`${ss1.x},${ss1.y} ${ss2.x},${ss2.y} ${ss3.x},${ss3.y} ${ss4.x},${ss4.y}`} fill="#18181b" stroke="#27272a" strokeWidth="1" />
                  </g>
                );
              }

              return null;
            })()}

            {/* Render projected bones/lines of the mannequin */}
            {lines.map(([j1, j2], idx) => {
              const p1 = projectedJoints[j1];
              const p2 = projectedJoints[j2];
              if (!p1 || !p2) return null;

              // Check if bone belongs to active muscle highlighting
              const isHighlight = muscleJoints.includes(j1) && muscleJoints.includes(j2);
              
              // Pulsing highlight state during core concentric contraction
              const muscleActivating = Math.sin(time) > 0;
              const opacity = isHighlight ? (muscleActivating ? 1.0 : 0.4) : 0.85;
              const strokeColor = isHighlight ? '#C1FF72' : '#ffffff';
              const strokeWidth = isHighlight ? 8 : 4;

              return (
                <line 
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  opacity={opacity}
                  style={{ transition: 'stroke-width 0.2s ease, opacity 0.2s ease' }}
                />
              );
            })}

            {/* Render projected joints as rounded circles */}
            {Object.entries(projectedJoints).map(([key, p]) => {
              if (key.startsWith('barbell')) return null; // barbell weights are custom rendered below

              const isHead = key === 'head';
              const isMuscleGroup = muscleJoints.includes(key);
              
              let r = 4.5;
              let color = '#ffffff';
              let op = 0.9;

              if (isHead) {
                r = 11;
                color = '#e4e4e7';
              } else if (isMuscleGroup) {
                color = '#C1FF72';
                r = 5.5;
                op = 1;
              }

              return (
                <circle 
                  key={key}
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={color}
                  opacity={op}
                  stroke={isHead ? '#27272a' : 'none'}
                  strokeWidth={isHead ? 2 : 0}
                />
              );
            })}

            {/* Custom high-contrast Barbell weights plates rendering */}
            {projectedJoints['barbell_l'] && projectedJoints['barbell_r'] && (
              <g>
                {/* Barbell plates left side */}
                {(() => {
                  const bL = projectedJoints['barbell_l'];
                  const bR = projectedJoints['barbell_r'];
                  // Draw plate circles at the ends of barbell
                  return (
                    <>
                      <circle cx={bL.x} cy={bL.y} r="14" fill="#18181b" stroke="#e4e4e7" strokeWidth="2.5" opacity="0.95" />
                      <circle cx={bL.x} cy={bL.y} r="8" fill="#27272a" />
                      <circle cx={bR.x} cy={bR.y} r="14" fill="#18181b" stroke="#e4e4e7" strokeWidth="2.5" opacity="0.95" />
                      <circle cx={bR.x} cy={bR.y} r="8" fill="#27272a" />
                    </>
                  );
                })()}
              </g>
            )}

            {/* Custom high-contrast Dumbbell plates rendering */}
            {(() => {
              const isDumbbell = exercise.id.includes('dumbbell') || exercise.name.includes('덤벨');
              if (isDumbbell && projectedJoints['hand_l'] && projectedJoints['hand_r']) {
                const hL = projectedJoints['hand_l'];
                const hR = projectedJoints['hand_r'];
                return (
                  <g opacity="0.95">
                    {/* Left Dumbbell */}
                    <line x1={hL.x - 11} y1={hL.y} x2={hL.x + 11} y2={hL.y} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x={hL.x - 14} y={hL.y - 6} width="3" height="12" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" rx="1" />
                    <rect x={hL.x + 11} y={hL.y - 6} width="3" height="12" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" rx="1" />
                    
                    {/* Right Dumbbell */}
                    <line x1={hR.x - 11} y1={hR.y} x2={hR.x + 11} y2={hR.y} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x={hR.x - 14} y={hR.y - 6} width="3" height="12" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" rx="1" />
                    <rect x={hR.x + 11} y={hR.y - 6} width="3" height="12" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" rx="1" />
                  </g>
                );
              }
              return null;
            })()}
          </svg>

          {/* Muscle scanner target label */}
          <div className="absolute top-3 left-3 bg-zinc-950/95 border border-zinc-850 px-3 py-1.5 rounded-xl text-[10px] text-zinc-400 font-semibold space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
              <span className="text-zinc-500">TARGET:</span>
              <span className="text-zinc-200 font-bold font-mono">
                {exercise.category === '가슴' && 'Pectorals (대흉근)'}
                {exercise.category === '등' && 'Lats (광배근/등)'}
                {exercise.category === '하체' && 'Quads & Glutes (하체)'}
                {exercise.category === '어깨' && 'Deltoids (어깨)'}
                {exercise.category === '팔' && 'Biceps/Triceps (팔)'}
                {exercise.category === '복근' && 'Abs Core (복직근)'}
                {exercise.category === '유산소' && 'Cardio Vascular (심폐)'}
                {!['가슴','등','하체','어깨','팔','복근','유산소'].includes(exercise.category) && 'Full Body (전신 협응)'}
              </span>
            </div>
          </div>

          {/* Speed Indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-zinc-950/80 px-2 py-1.5 rounded-lg border border-zinc-900">
            <Activity className="w-3.5 h-3.5 text-brand-neon animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-400 font-mono">POSTURE ENGINE LIVE</span>
          </div>
        </div>

        {/* Viewport Control Panel Side Panel */}
        <div className="w-full md:w-2/5 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3.5">
            <div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider font-display">실시간 3D 자세 관찰기</h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed mt-1">
                3D 스켈레톤 마네킹의 완벽한 궤적을 확인하세요. 하단 슬라이더를 조작하면 각도를 360도 회전하며 입체적으로 분석할 수 있습니다.
              </p>
            </div>

            {/* Orbit degree Slider */}
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-brand-neon" /> 관찰 앵글 회전
                </span>
                <span className="text-brand-neon font-mono font-black">{orbitAngle}°</span>
              </div>
              <input 
                type="range"
                min="0"
                max="360"
                value={orbitAngle}
                onChange={(e) => setOrbitAngle(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-neon focus:outline-none"
              />
            </div>
          </div>

          {/* Playback Control Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 transition ${
                isPlaying 
                  ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300' 
                  : 'bg-brand-neon text-zinc-950 shadow-lg shadow-brand-neon/10 font-extrabold'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  운동 일시정지
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  자세 모션 재생
                </>
              )}
            </button>
            <button
              onClick={() => setOrbitAngle(35)}
              className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition"
              title="관찰 각도 초기화"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Styled Gym Equipment Showcase Column */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4 text-brand-neon" />
          이렇게 생긴 기구로 운동해요!
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" id="equipment-grid-view">
          {guideData.equipment.map((eq, idx) => (
            <div 
              key={idx}
              className="bg-zinc-950 border border-zinc-900/80 rounded-2xl p-4 flex items-center gap-3.5 hover:border-zinc-800 group transition duration-300"
            >
              <div className="w-14 h-14 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center justify-center shrink-0">
                {renderEquipmentThumbnail(eq.type)}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-bold text-xs text-zinc-200 group-hover:text-white transition">
                  {eq.name}
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium truncate">
                  {eq.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics and Guides tab headers */}
      <div className="border-b border-zinc-900 flex gap-4" id="exercise-tabs-selector">
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 text-xs md:text-sm font-black uppercase tracking-tight relative transition ${
            activeTab === 'guide' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> 가이드/메모
          </span>
          {activeTab === 'guide' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-neon rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 text-xs md:text-sm font-black uppercase tracking-tight relative transition ${
            activeTab === 'records' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> 분석/기록
          </span>
          {activeTab === 'records' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-neon rounded-full" />
          )}
        </button>
      </div>

      {/* Tabs panels render */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 md:p-6 shadow-sm">
        {activeTab === 'guide' ? (
          <div className="space-y-5 animate-fade-in">
            {/* Guide sub-navigation tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveGuideSubTab('comment')}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activeGuideSubTab === 'comment'
                    ? 'bg-zinc-900 text-brand-neon border border-brand-neon/20'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> 코치의 코멘트
                </span>
              </button>

              <button
                onClick={() => setActiveGuideSubTab('instructions')}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activeGuideSubTab === 'instructions'
                    ? 'bg-zinc-900 text-brand-neon border border-brand-neon/20'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> 운동 가이드
                </span>
              </button>

              <button
                onClick={() => setActiveGuideSubTab('precautions')}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all ${
                  activeGuideSubTab === 'precautions'
                    ? 'bg-zinc-900 text-brand-neon border border-brand-neon/20'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 주의사항
                </span>
              </button>
            </div>

            {/* Sub-tab content */}
            <div className="pt-2">
              {activeGuideSubTab === 'comment' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest font-display">Coach's Professional Comment</h4>
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-neon/10 flex items-center justify-center text-brand-neon shrink-0 font-black text-sm italic font-display">
                      C
                    </div>
                    <p className="text-zinc-300 text-xs md:text-sm font-semibold leading-relaxed mt-0.5">
                      {guideData.coachComment}
                    </p>
                  </div>
                </div>
              )}

              {activeGuideSubTab === 'instructions' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest font-display">Step-by-Step Exercise Guide</h4>
                  <div className="space-y-2.5">
                    {guideData.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-3.5 p-3.5 bg-zinc-950/50 rounded-2xl border border-zinc-900/60 items-start">
                        <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center font-mono text-[10px] text-brand-neon font-black shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-zinc-300 text-xs font-semibold leading-relaxed pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeGuideSubTab === 'precautions' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest font-display">Safety and Form Precautions</h4>
                  <div className="space-y-2.5">
                    {guideData.precautions.map((warn, idx) => (
                      <div key={idx} className="flex gap-3.5 p-3.5 bg-red-950/15 border border-red-900/30 rounded-2xl items-start text-red-300">
                        <AlertTriangle className="w-5 h-5 stroke-[2] shrink-0 mt-0.5 text-red-400" />
                        <p className="text-xs font-semibold leading-relaxed">
                          {warn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in" id="analytics-tab-panel">
            {/* Exercise Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">총 수행 횟수</span>
                <span className="text-xl font-black text-zinc-100 block font-mono">{stats.totalCompletedTimes}회</span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">개인 최고 기록 (PR)</span>
                <span className="text-xl font-black text-brand-neon block font-mono">
                  {stats.maxWeight > 0 ? `${stats.maxWeight}kg` : '기록 없음'}
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">예상 1RM 한계치</span>
                <span className="text-xl font-black text-zinc-100 block font-mono">
                  {stats.estimated1RM > 0 ? `${stats.estimated1RM}kg` : '계산 불가능'}
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">누적 트레이닝 중량</span>
                <span className="text-xl font-black text-zinc-100 block font-mono">
                  {stats.totalVolume > 0 ? `${stats.totalVolume.toLocaleString()}kg` : '기록 없음'}
                </span>
              </div>
            </div>

            {/* Sparkline Progress Line Chart */}
            {stats.historyPoints.length > 1 && (
              <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-neon" /> 수행 최고 중량 성장곡선
                  </span>
                  <span className="text-[10px] text-zinc-600 font-bold font-mono">PROGRESS HISTORY</span>
                </div>
                
                {/* Visual SVG Chart */}
                <div className="h-28 w-full flex items-end pt-4 pr-2">
                  <svg className="w-full h-full overflow-visible">
                    {(() => {
                      const width = 600;
                      const height = 80;
                      const points = stats.historyPoints;
                      const weights = points.map(p => p.weight);
                      const minW = Math.min(...weights) * 0.9;
                      const maxW = Math.max(...weights) * 1.1;
                      const diff = maxW - minW === 0 ? 1 : maxW - minW;

                      const svgPoints = points.map((p, idx) => {
                        const x = (idx / (points.length - 1)) * 96 + 2; // % width
                        const y = 80 - ((p.weight - minW) / diff) * 60 - 5;
                        return { x, y, label: p.date, weight: p.weight };
                      });

                      // Draw line path
                      let pathD = '';
                      svgPoints.forEach((p, idx) => {
                        if (idx === 0) pathD += `M ${p.x}% ${p.y}`;
                        else pathD += ` L ${p.x}% ${p.y}`;
                      });

                      return (
                        <>
                          {/* Grid horizontal markers */}
                          <line x1="0" y1="20" x2="100%" y2="20" stroke="#1f1f23" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="0" y1="50" x2="100%" y2="50" stroke="#1f1f23" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="0" y1="80" x2="100%" y2="80" stroke="#1f1f23" strokeWidth="1" />

                          {/* Glow area underneath line */}
                          {pathD && (
                            <path 
                              d={`${pathD} L 98% 80 L 2% 80 Z`}
                              fill="url(#spark-glow)"
                              opacity="0.1"
                            />
                          )}

                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="spark-glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C1FF72" />
                              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Main line */}
                          {pathD && (
                            <path 
                              d={pathD}
                              fill="none"
                              stroke="#C1FF72"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Data dots with weight labels */}
                          {svgPoints.map((p, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={`${p.x}%`} 
                                cy={p.y} 
                                r="5" 
                                fill="#C1FF72" 
                                stroke="#09090b" 
                                strokeWidth="2.5" 
                              />
                              {/* Label showing date/weight */}
                              <text 
                                x={`${p.x}%`} 
                                y={p.y - 12} 
                                textAnchor="middle" 
                                fill="#a1a1aa" 
                                fontSize="9" 
                                fontWeight="bold"
                                className="font-mono"
                              >
                                {p.weight}kg
                              </text>
                              <text 
                                x={`${p.x}%`} 
                                y="96" 
                                textAnchor="middle" 
                                fill="#52525b" 
                                fontSize="8" 
                                fontWeight="bold"
                                className="font-mono"
                              >
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Timeline records */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest font-display">최근 트레이닝 기록 타임라인</h4>
              {stats.matchingWorkouts.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.matchingWorkouts.map((workout, idx) => {
                    const matchedEx = workout.exercises.find(e => e.exerciseId === exercise.id);
                    if (!matchedEx) return null;

                    return (
                      <div 
                        key={workout.id} 
                        className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 font-mono font-black block">{workout.date}</span>
                            <span className="text-xs font-extrabold text-zinc-200">{workout.routineName}</span>
                          </div>
                        </div>

                        {/* Sets list */}
                        <div className="flex flex-wrap gap-1.5">
                          {matchedEx.sets.map((set, sIdx) => (
                            <span 
                              key={set.id}
                              className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 font-mono text-[10px] font-extrabold border border-zinc-850/60"
                            >
                              {set.setNumber}세트: {set.weight > 0 ? `${set.weight}kg` : ''} {set.reps}회
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900/80 rounded-2xl p-6 text-center space-y-2.5">
                  <div className="w-11 h-11 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 mx-auto">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-zinc-300">수행 이력 없음</h5>
                    <p className="text-[10px] text-zinc-600 max-w-xs mx-auto leading-relaxed">
                      아직 일지에 기록된 운동 이력이 존재하지 않습니다. 운동을 수행하고 일지를 완성하면 상세 성장 분석 지표가 연동됩니다!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
