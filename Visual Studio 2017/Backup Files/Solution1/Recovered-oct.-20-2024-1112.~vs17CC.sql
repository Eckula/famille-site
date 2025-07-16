SELECT [Askia_Lists].[dbo].[AskList11782].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - BEL"
FROM [Askia_Lists].[dbo].[AskList11782]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11782]
ON [Askia_Lists].[dbo].[AskList11782].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11782].[AskEmail]
GROUP BY [Age]
ORDER BY [Age]


-- Requête pour exclure les emails de relance
SELECT [Askia_Lists].[dbo].[AskList11782].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - BEL"
FROM [Askia_Lists].[dbo].[AskEmail11782]
INNER JOIN [Askia_Lists].[dbo].[AskList11782]
    ON [Askia_Lists].[dbo].[AskList11782].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11782].[AskEmail]
WHERE AskType = 0 
GROUP BY [Askia_Lists].[dbo].[AskList11782].[Age]
ORDER BY [Askia_Lists].[dbo].[AskList11782].[Age];