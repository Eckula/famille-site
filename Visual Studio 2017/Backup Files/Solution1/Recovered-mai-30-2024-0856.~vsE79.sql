/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[Numero_contrat]
      ,[DATE SOUSCRIPTION]
      ,[Date_effet]
      ,[Formule]
      ,[Formule_souscrite]
      ,[CANAL]
      ,[SEXE]
      ,[nom]
      ,[prenom]
      ,[e_mail]
      ,[Date_naissance]
      ,[AGE]
      ,[CIBLE]
      ,[Top_detenteur_AUTO]
      ,[Top_detenteur_MRH]
      ,[Top_detenteur_PJ]
      ,[Top_detenteur_AAV]
      ,[Top_detenteur_SANTE]
      ,[VAGUE]
      ,[Doublons]
      ,[LIB_CIV]
      ,[LIB_TYPE_CONTRAT]
      ,[LIB_TYPE_CONTRAT_2]
      ,[DATE_SOUS]
  FROM [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]


  ALTER TABLE [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024]
  ADD [Occurrences] NVARCHAR(255);

  BFA0134