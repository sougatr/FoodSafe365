export const sprint19 = {
  outlet:{name:'ABC Restaurant',city:'Mumbai'},
  status:{
    value:88,
    label:'ATTENTION',
    trend:-4,
    comparison:'previous 30 days',
    explanation:'Three temperature deviations, one overdue corrective action and two missed checks are currently affecting the control status.',
    factors:[
      {id:'refrigeration',label:'Refrigeration',value:'3 deviations',detail:'Three temperature deviations from Refrigerator 2 in the last 7 days.',severity:'high',href:'/manager/risk/refrigeration'},
      {id:'actions',label:'Corrective actions',value:'1 overdue',detail:'One corrective action is past its due date.',severity:'medium',href:'/actions'},
      {id:'checks',label:'Daily checks',value:'2 missed today',detail:'Two opening hygiene checks were not recorded today.',severity:'medium',href:'/manager/risk/missed-checks'}
    ],
    positives:[
      {label:'Checks completed',value:'25 of 28',detail:'89% of scheduled checks have been completed in the current period.'},
      {label:'Actions closed this month',value:'18',detail:'Corrective actions closed after completion and verification.'}
    ]
  },
  attention:[
    {id:'refrigeration',severity:'high',title:'Refrigerator 2',summary:'3 temperature deviations in the last 7 days',meta:'Cold storage · 3/7 checks outside target',action:'Review'},
    {id:'overdue-cleaning',severity:'medium',title:'Cold-room drain cleaning',summary:'Corrective action is overdue',meta:'Due yesterday · Assigned to Kitchen Supervisor',action:'Review'},
    {id:'missed-checks',severity:'medium',title:'Opening hygiene checks',summary:'2 checks were missed today',meta:'Opening shift · 8:00–9:00 AM',action:'Review'}
  ],
  metrics:{checks:{completed:25,total:28},openActions:4,overdueActions:1,awaitingVerification:2,closedThisMonth:18},
  trends:[
    {label:'Temperature compliance',value:84,baseline:91,trend:'down'},
    {label:'Daily check completion',value:94,baseline:89,trend:'up'},
    {label:'Actions closed on time',value:76,baseline:81,trend:'down'},
    {label:'Recurring issues',value:3,baseline:5,trend:'up-good'}
  ],
  recurring:[
    {id:'refrig',title:'Refrigeration',count:3,period:'7 days',area:'Cold storage',severity:'high',text:'The same refrigerator has repeated temperature deviations.'},
    {id:'hygiene',title:'Hand hygiene',count:4,period:'14 days',area:'Preparation area',severity:'medium',text:'Four hygiene observations required correction.'},
    {id:'cleaning',title:'Cleaning completion',count:5,period:'30 days',area:'Kitchen',severity:'medium',text:'Cleaning checks are being left incomplete.'}
  ],
  equipment:[
    {id:'ref2',name:'Refrigerator 2',type:'Refrigerator',location:'Cold room',status:'attention',signal:'3 temperature deviations / 7 days',calibration:'Due in 12 days'},
    {id:'thermo1',name:'Thermometer 1',type:'Temperature monitor',location:'Main kitchen',status:'due',signal:'Calibration due soon',calibration:'Due in 12 days'},
    {id:'freezer1',name:'Freezer 1',type:'Freezer',location:'Cold room',status:'good',signal:'No current concerns',calibration:'Current'}
  ],
  people:{missed:'Morning opening checks',window:'8:00–9:00 AM',suggestion:'Consider a short refresher for opening-shift staff.'},
  documents:[
    {title:'Pest-control certificate',status:'expiring',due:'12 days'},
    {title:'Water test report',status:'expiring',due:'21 days'},
    {title:'Food licence',status:'valid',due:'Current'},
    {title:'Cleaning records',status:'valid',due:'Current'}
  ],
  recommendations:[
    {id:'rec-ref',title:'Review Refrigerator 2 today',reason:'Three temperature deviations have been recorded in seven days.',next:'Check loading, door opening and thermometer accuracy.',confidence:'High',type:'Equipment'},
    {id:'rec-training',title:'Refresh opening-shift hygiene checks',reason:'Two checks were missed today and the same check is frequently incomplete.',next:'Run a 10-minute refresher and confirm the opening checklist is understood.',confidence:'Medium',type:'People'},
    {id:'rec-doc',title:'Renew pest-control certificate',reason:'The certificate expires in 12 days.',next:'Assign renewal to the responsible manager.',confidence:'High',type:'Documentation'}
  ]
};
