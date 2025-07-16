/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[Fichier d'origine]
      ,[ContactID]
      ,[First and Last Name]
      ,[Mode de sollicitation]
      ,[EMAIL]
      ,[CODE_DEPT]
      ,[UDA5]
      ,[TRANCHE_AGE]
      ,[CLIENT PREDORMANT OU DORMANT]
      ,[LB_CONT]
      ,[Mobile Phone]
      ,[KO_CNTC_TEL_PORT]
      ,[KO_CNTC_EMAIL]
      ,[SmsOptIn (App_v1)]
      ,[SMS Opt-out]
      ,[FL_STOP_MAILING]
      ,[FL_STOP_PHONING]
      ,[TYPE_ENERGIE]
      ,[CODE_DPT]
      ,[UDA51]
      ,[UDA9]
      ,[LIB_UDA5]
      ,[PRENOM]
      ,[NOM]
      ,[TELEPHONE]
      ,[MODE_SOLLICITATION]
      ,[Relance1]
      ,[Invitation_SMS]
      ,[Invitation_Tirage_Au_Sort]
  FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]

UPDATE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine] SET Relance1='Relance1' WHERE ID_ENOV=1;


SELECT*
FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
WHERE ID_ENOV = '1'

UPDATE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine] SET Relance1=&"Relance1"& WHERE ID_ENOV=1;



