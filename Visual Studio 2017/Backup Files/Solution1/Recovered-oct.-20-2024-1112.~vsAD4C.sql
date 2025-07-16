SELECT [Askia_Lists].[dbo].[AskList11784].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - NL"
FROM [Askia_Lists].[dbo].[AskList11784]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11784]
ON [Askia_Lists].[dbo].[AskList11784].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11784].[AskEmail]
GROUP BY [Age]
ORDER BY [Age]


-- Requête pour exclure les emails de relance
SELECT [Askia_Lists].[dbo].[AskList11784].[Age], COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - NL"
FROM [Askia_Lists].[dbo].[AskEmail11784]
INNER JOIN [Askia_Lists].[dbo].[AskList11784]
    ON [Askia_Lists].[dbo].[AskList11784].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11784].[AskEmail]
WHERE AskType = 0 
GROUP BY [Askia_Lists].[dbo].[AskList11784].[Age]
ORDER BY [Askia_Lists].[dbo].[AskList11784].[Age];












-- Requête pour exclure les emails de relance
SELECT [Askia_Lists].[dbo].[AskList11784].[Age], 
       COUNT(*) AS "TSP1822_APRR_SatisfactionFULLI - NL"
FROM [Askia_Lists].[dbo].[AskList11784]
INNER JOIN [Askia_Lists].[dbo].[AskEmail11784]
    ON [Askia_Lists].[dbo].[AskList11784].[EMAIL] = [Askia_Lists].[dbo].[AskEmail11784].[AskEmail]
-- Ajout d'un LEFT JOIN pour identifier les emails de relance
LEFT JOIN (
    -- Cette sous-requête identifie les emails de relance
    SELECT AskEmail
    FROM [LISTE_UTILISEES]
    WHERE AskState = 0 
) AS relances
    ON [Askia_Lists].[dbo].[AskEmail11784].[AskEmail] = relances.AskEmail
-- Exclusion des emails de relance
WHERE relances.AskEmail IS NULL
GROUP BY [Askia_Lists].[dbo].[AskList11784].[Age]
ORDER BY [Askia_Lists].[dbo].[AskList11784].[Age];