/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[ID_RETAIL]
      ,[ENTREPRISE]
      ,[NOM]
      ,[PRENOM]
      ,[ADRESSE_MAIL]
      ,[TELEPHONE]
      ,[NUMERO_TEL]
      ,[TYPE_TEL]
      ,[DEPARTEMENT]
      ,[FONCTION]
      ,[CLASSIFICATION]
      ,[CA_RECODE]
      ,[FAMILLE_RECOD]
      ,[STATUT]
      ,[lien]
  FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]
 where statut =2
 
 SELECT *
 FROM [Askia_Lists].[dbo].[AskList11886]
  Where AskLastWebResult=0

   FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]