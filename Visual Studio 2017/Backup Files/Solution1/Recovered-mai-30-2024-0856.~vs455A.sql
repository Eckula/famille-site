/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [InterviewID]
      ,[NumericData]
  FROM [Enov].[dbo].


   UPDATE [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]
    SET  [LIB_TYPE_CONTRAT_2] = "Un contrat d'assurance auto"
    WHERE [LIB_TYPE_CONTRAT] like 1;


UPDATE [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]
SET [LIB_PRODUIT_2] = REPLACE([LIB_PRODUIT_2] , '8', '9')
WHERE [LIB_PRODUIT_2] like 9