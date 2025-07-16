/****** Script de la commande SelectTopNRows à partir de SSMS  ******/

*********CIBLE 1 Accidents

SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11483] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11483] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Accidents%'
	 GROUP BY LastResult;

*********CIBLE 2 Auto_
SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11483] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11483] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Auto%'
	 GROUP BY LastResult;
	 
********************CIBLE 3 CompSanté
SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11483] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11483] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Santé%'
	GROUP BY LastResult;
	
******************* CIBLE 4 Habitation
SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11483] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11483] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Habitation%'
	 GROUP BY LastResult;

******************** CIBLE 5 Habitation
SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11483] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11483] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Juridique%'
	 GROUP BY LastResult;

	 ********************* Base globale_V1
SELECT count (A.AskInterview), LastResult
  FROM [Askia_Lists].[dbo].[AskEmail11433] AS A
  LEFT JOIN [Askia_Lists].[dbo].[AskList11433] AS B ON B.AskInterview=A.AskInterview
    where cible LIKE '%Accidents%'
	 GROUP BY LastResult;




  
    SELECT  CIBLE, count (CIBLE) as Nombre_de_ligne
    FROM [ListesExternes].[dbo].[BFA0134_SOCGENERAL_NveauxSouscrip_Baro2024_V2]
	WHERE [DOUBLONS_OK_2] = 0
	group by CIBLE;
 ************* ce qui reste à faire
 SELECT CIBLE_SUITE, count (AskInterview)
  FROM [Askia_Lists].[dbo].[AskList11483]
  where AskLastWebResult <>0 or AskLastWebResult is NULL
  group by CIBLE_SUITE
  order by CIBLE_SUITE;