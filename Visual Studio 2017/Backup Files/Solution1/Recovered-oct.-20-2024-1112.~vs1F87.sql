SELECT [Askia_Lists].[dbo].[AskList11783].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - FR/SUISSE"
FROM [Askia_Lists].[dbo].[AskList11783]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11783]
ON [Askia_Lists].[dbo].[AskList11783].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11783].[AskEmail]
GROUP BY [Age]
ORDER BY [Age]


Set @MAIL_ENVOYE_2='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES'','+ @PAR_LISTE +'
FROM
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'



-- Requête pour exclure les emails de relance
SELECT [Askia_Lists].[dbo].[AskList11783].[Age], 
       COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - FR/SUISSE"
FROM [Askia_Lists].[dbo].[AskEmail11783]
INNER JOIN [Askia_Lists].[dbo].[AskList11783]
    ON [Askia_Lists].[dbo].[AskList11783].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11783].[AskEmail]
WHERE AskType = 0 
GROUP BY [Askia_Lists].[dbo].[AskList11783].[Age]
ORDER BY [Askia_Lists].[dbo].[AskList11783].[Age];



-- Ajout d'un LEFT JOIN pour identifier les emails de relance
LEFT JOIN (
    -- Identification des emails de relance
    SELECT AskEmail
    FROM [LISTE_UTILISEES]
    --WHERE AskState = 0 AND AskType > 0
	WHERE AskState = 0 AND AskType > 0
) AS relances
    ON [Askia_Lists].[dbo].[AskEmail11783].[AskEmail] = relances.AskEmail
-- Exclusion des emails de relance
WHERE relances.AskEmail IS NULL



SELECT * 
FROM [LISTE_UTILISEES].[dbo];

