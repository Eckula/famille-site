SELECT [Askia_Lists].[dbo].[AskList11782].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - BE"
FROM [Askia_Lists].[dbo].[AskList11782]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11782]
ON [Askia_Lists].[dbo].[AskList11782].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11782].[AskEmail]
GROUP BY [Age]

SELECT [Askia_Lists].[dbo].[AskList11783].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - FRA/SUISSE"
FROM [Askia_Lists].[dbo].[AskList11783]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11783]
ON [Askia_Lists].[dbo].[AskList11783].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11783].[AskEmail]
GROUP BY [Age]

SELECT [Askia_Lists].[dbo].[AskList11784].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - NL"
FROM [Askia_Lists].[dbo].[AskList11784]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11784]
ON [Askia_Lists].[dbo].[AskList11784].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11784].[AskEmail]
GROUP BY [Age]