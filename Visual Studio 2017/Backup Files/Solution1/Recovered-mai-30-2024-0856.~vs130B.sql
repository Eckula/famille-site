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
      ,[DOUBLONS_OK_2]
      ,[CIBLE_SUITE]
      ,[DOUBLONS_Ocurrence]
  FROM [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]

  select*
   from [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]
   where [CIBLE] like '%Juridique%' AND [DOUBLONS_OK_2] = 0 and [ID_ENOV] = 110638;

   select*
   from [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]
   where  [ID_ENOV] like 110638;
   
   select*
   from [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]
   where  [ID_ENOV] like 36967;

      select*
   from [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]
   where  [ID_ENOV] like 28435;






