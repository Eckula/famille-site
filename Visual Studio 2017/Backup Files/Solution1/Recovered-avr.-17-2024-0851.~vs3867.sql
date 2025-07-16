/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (30000) [NOIDE]
      ,[NOM]
      ,[PRENOM]
      ,[SEXE]
      ,[AGE_MILLESIME]
      ,[ANCIENNETE]
      ,[STATUT]
      ,[GAMME]
      ,[FORMULE]
      ,[TOP_BC]
      ,[NB_BE]
      ,[T_AGE]
      ,[COMP_FAM]
      ,[NATURE_ACTIVITE]
      ,[DEPARTEMENT]
      ,[REGION]
      ,[TEL_FIXE]
      ,[TEL_MOBILE]
      ,[ADRESSE_MAIL]
      ,[CODCNL]
      ,[VALPREF]
      ,[VALACD]
      ,[CODTRT]
      ,[Réclamation/Contentieux]
      ,[IDENOV]
      ,[ORIGINE]
      ,[TEL1]
      ,[Doublon]
      ,[Doublon_vague1]
      ,[SEXE_NUM]
      ,[T_AGE_NUM]
      ,[T_AGE2]
      ,[FORMULE_NUM]
      ,[GAMME_NUM]
      ,[TOP_BC_NUM]
      ,[COMP_FAM_NUM]
      ,[NATURE_ACTIVITE_NUM]
      ,[DEPARTEMENT_NUM]
      ,[REGION_NUM]
      ,[VAGUE]
      ,[TYPETEL]
  FROM [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
  WHERE [GAMME] = 'EFS'


UPDATE [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
SET [TEL1] = '33'
WHERE [TEL1] like 033


UPDATE [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
SET [TEL1]  = REPLACE([TEL1] , '33', '033')
WHERE [TEL1] like '033'

UPDATE [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
SET [TEL1]  = REPLACE([TEL1] , '033', '33')
WHERE [TEL1]  LIKE '%033%';


UPDATE [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
SET [TEL_FIXE]  = REPLACE([TEL_FIXE] , '033', '33')
WHERE [TEL_FIXE]  LIKE '%033%';


UPDATE [ListesExternes].[dbo].[BFA0121_MGEN_Baro_sat_global_avril2024]
SET [TEL_MOBILE]  = REPLACE([TEL_MOBILE] , '033', '33')
WHERE [TEL_MOBILE]  LIKE '%033%';







