/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (5000) [ID_ENOV]
      ,[PRODUIT_FINAL_0]
      ,[CODE_ID_Par personne]
      ,[ID_Par personne]
      ,[CIVILITE]
      ,[NOM]
      ,[PRENOM]
      ,[SEXE_0]
      ,[DATNAI]
      ,[NB_BE]
      ,[NB_BC]
      ,[NOVOI]
      ,[NATVOI]
      ,[LIBVOI]
      ,[LIEUDIT]
      ,[CODPTL]
      ,[LOC]
      ,[CODPAYS]
      ,[FIXE_FINAL]
      ,[MOBILE_1]
      ,[MOBILE_2]
      ,[ADRESSE_MAIL]
      ,[DEPT]
      ,[OFFRE]
      ,[DATE ADH]
      ,[PRODUIT_FINAL]
      ,[LIB_PRODUIT]
      ,[LIB_PRODUIT_2]
      ,[TRANCHE_AGE]
      ,[AGE_F]
      ,[AGE_CLAIR]
      ,[SEXE]
      ,[TEL_1]
      ,[ADR_TYPE]
  FROM [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]


   SELECT*
   FROM [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
   WHERE [LIB_PRODUIT] LIKE 16 and [PRODUIT_FINAL] =2;
   
   SELECT*
   FROM [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
   WHERE [LIB_PRODUIT] LIKE 16 and [PRODUIT_FINAL_0] like '%Santé';



UPDATE [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
SET [LIB_PRODUIT_2]  = REPLACE([LIB_PRODUIT_2], '7', '16')
WHERE [PRODUIT_FINAL_0] LIKE '%Prévoyance%' and [LIB_PRODUIT] = 15 and [PRODUIT_FINAL] =2;


WHERE [OFFRE] like '%CD 89 PRÉV.%';







   WHERE [LIB_PRODUIT_2] LIKE 6;
   WHERE [LIB_PRODUIT] LIKE 9;
  

  WHERE [OFFRE] LIKE '%CD 43 PREV%';
  WHERE [LIB_PRODUIT_2] LIKE 13;



