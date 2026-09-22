-- FoodSafe365 Sprint 13: operationalise the five priority temperature controls.
-- Safe to run after Sprint 12 seed. Uses IF/NOT EXISTS guards.

INSERT INTO rules(id,rule_code,title,description,domain,source_id,source_clause,source_version,risk_level,frequency,active,version,effective_from)
SELECT gen_random_uuid(),'FS-PREP-007','Thawing control','Is thawing performed hygienically using the approved process?','thawing',s.id,'Thawing control','FSSAI/GHP','critical','event_driven',true,1,current_date
FROM sources s WHERE s.source_name='FSSAI/GHP' ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO rule_conditions(id,rule_id,condition_type,field_name,operator,value)
SELECT gen_random_uuid(),r.id,'outlet_attribute','applicability','exists',jsonb_build_object('text','Frozen foods requiring thawing')
FROM rules r WHERE r.rule_code='FS-PREP-007'
AND NOT EXISTS (SELECT 1 FROM rule_conditions rc WHERE rc.rule_id=r.id);

INSERT INTO check_template_items(id,check_template_id,rule_id,question,help_text,response_type,sequence_no,required,evidence_required,active)
SELECT gen_random_uuid(),t.id,r.id,'Is cooking performed according to the approved process and monitored?','Cooking temperature/time control','temperature',33,true,false,true
FROM check_templates t,rules r WHERE t.code='DAILY_FOOD_SAFETY' AND r.rule_code='FS-PREP-003'
AND NOT EXISTS (SELECT 1 FROM check_template_items x WHERE x.check_template_id=t.id AND x.rule_id=r.id);

INSERT INTO check_template_items(id,check_template_id,rule_id,question,help_text,response_type,sequence_no,required,evidence_required,active)
SELECT gen_random_uuid(),t.id,r.id,'Is high-risk cooked food cooled according to the approved process?','Cooling temperature/time control','temperature',34,true,false,true
FROM check_templates t,rules r WHERE t.code='DAILY_FOOD_SAFETY' AND r.rule_code='FS-PREP-005'
AND NOT EXISTS (SELECT 1 FROM check_template_items x WHERE x.check_template_id=t.id AND x.rule_id=r.id);

INSERT INTO check_template_items(id,check_template_id,rule_id,question,help_text,response_type,sequence_no,required,evidence_required,active)
SELECT gen_random_uuid(),t.id,r.id,'Is thawing performed hygienically using the approved method?','Thawing method and temperature/time control','temperature',35,true,false,true
FROM check_templates t,rules r WHERE t.code='DAILY_FOOD_SAFETY' AND r.rule_code='FS-PREP-007'
AND NOT EXISTS (SELECT 1 FROM check_template_items x WHERE x.check_template_id=t.id AND x.rule_id=r.id);

INSERT INTO check_template_items(id,check_template_id,rule_id,question,help_text,response_type,sequence_no,required,evidence_required,active)
SELECT gen_random_uuid(),t.id,r.id,'Is reheating performed according to the approved process and monitored?','Reheating temperature/time control','temperature',36,true,false,true
FROM check_templates t,rules r WHERE t.code='DAILY_FOOD_SAFETY' AND r.rule_code='FS-PREP-006'
AND NOT EXISTS (SELECT 1 FROM check_template_items x WHERE x.check_template_id=t.id AND x.rule_id=r.id);
