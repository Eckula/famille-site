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
 where statut =0
 
 SELECT *
 FROM [Askia_Lists].[dbo].[AskList11886]
  Where AskLastWebResult=0

   FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]

   select *
    FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]
	where ADRESSE_MAIL ='remi.bellocq@groupe-daniel.fr'



	 select *
    FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]
	where lien = 'https://www.merciderepondre.com/WebProd/cgi-bin/askiaext.dll?Action=DoPanel&Survey=000196U77PYV2MWP&PanelId=00035WQG0KRCUI7F@0003E413510UKLTM'


	select *
    FROM [ListesExternes].[dbo].[RET2554_TMP-CONVERT_SatisfactionJouplast]
	WHERE ADRESSE_MAIL = 'Carine.antoine@groupe-fb.com'
