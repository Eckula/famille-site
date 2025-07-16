/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (21000) [idkpep]
      ,[noide]
      ,[nom]
      ,[prenom]
      ,[sexe]
      ,[age_millesime]
      ,[t_age_detail]
      ,[t_age]
      ,[comp_fam]
      ,[nb_be]
      ,[nature_activite]
      ,[gamme]
      ,[formule]
      ,[statut]
      ,[anciennete]
      ,[departement]
      ,[region]
      ,[adresse_mail]
      ,[tel_fixe]
      ,[tel_mobile]
      ,[top_bc]
      ,[IDENOV]
      ,[ORIGINE]
      ,[TEL1]
      ,[Doublon]
      ,[Doublon_vague1]
      ,[SEXE_NUM]
      ,[T_AGE_NUM_OLD]
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
      ,[LiB_TEL]
  FROM [ListesExternes].[dbo].[BFA0168_MGEN_BaroSatglo_Avril2025]
  where [COMP_FAM_NUM] like '4'
 
  where [COMP_FAM] like 'MP SEUL'
  
  where [GAMME_NUM] like '6'
 
 where [gamme] like 'Efficience Santé'

UPDATE [listesExternes].[dbo].[BFA0168_MGEN_BaroSatglo_Avril2025]
SET GAMME_NUM = 2
WHERE GAMME_NUM = 6;


SELECT * 
FROM [listesExternes].[dbo].[BFA0168_MGEN_BaroSatglo_Avril2025]
WHERE GAMME_NUM = 2;
