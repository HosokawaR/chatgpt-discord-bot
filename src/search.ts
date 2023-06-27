import axios from "axios";
import { GCP_SEARCH_API_KEY, GOOGLE_CUSTOM_SEARCH_CX } from "./env.js";
import { JSDOM } from "jsdom";

const GOOGLE_SEARCH_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

export const search = async (query: string): Promise<string> => {
	const url = await searchInGoogle(query);
	const contents = await fetchWebsiteContents(url);
	const searchResult = `SOURCE URL: ${url}\n${contents}`;
	return searchResult;
};

const searchInGoogle = async (query: string): Promise<string> => {
	const apiKey = GCP_SEARCH_API_KEY;
	if (!apiKey) throw new Error("GCP_SEARCH_API_KEY is not defined");

	const cx = GOOGLE_CUSTOM_SEARCH_CX;
	if (!cx) throw new Error("GOOGLE_CUSTOM_SEARCH_CX is not defined");

	const searchUrl = encodeURI(
		`${GOOGLE_SEARCH_ENDPOINT}?q=${query}&key=${apiKey}&cx=${cx}`,
	);
	const results = await axios(searchUrl);
	const firstResult = results.data.items[0];
	return firstResult.link;
};

const fetchWebsiteContents = async (url: string): Promise<string> => {
	const response = await axios(url);
	const html = response.data;
	const document = new JSDOM(html).window.document;
	const minimized = minimizeWebsiteContents(document);
	return minimized;
};

const minimizeWebsiteContents = (document: Document): string => {
	const text = extractTextFromDocument(document);
	const minimized = text
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.join("\n")
		.replace(/ +/g, " ")
		.slice(0, 4000);
	return minimized;
};

const TAGS_TO_REMOVE = ["style", "script", "img", "iframe"];

const extractTextFromDocument = (document: Document): string => {
	TAGS_TO_REMOVE.forEach((tag) => {
		const targetNodes = [...document.getElementsByTagName(tag)];
		for (let node of targetNodes) {
			node.remove();
		}
	});

	const text = document.body.textContent;
	return text;
};
