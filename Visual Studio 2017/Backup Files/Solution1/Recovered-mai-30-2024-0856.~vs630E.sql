/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
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


   UPDATE [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]
    SET  [LIB_TYPE_CONTRAT_2] = "Un contrat d'assurance auto"
    WHERE [LIB_TYPE_CONTRAT] like 1;

 UPDATE [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
SET [LIB_PRODUIT_2]  = REPLACE([LIB_PRODUIT_2] , '9', '8')
WHERE [LIB_PRODUIT] like 16

 UPDATE [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
SET [LIB_PRODUIT_2]  = REPLACE([LIB_PRODUIT_2] , '4', '41')
WHERE [LIB_PRODUIT] like 9


 UPDATE [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
SET [LIB_PRODUIT_2]  = REPLACE([LIB_PRODUIT_2] , '9', '18')
WHERE [PRODUIT_FINAL] like 3 and [LIB_PRODUIT] like 16;





select*
FROM [ListesExternes].[dbo].[BFA0128_MGEN_Baro_ConventionDeParticipation]
WHERE [LIB_PRODUIT] like 9