import axios from "axios";
import { GCP_SEARCH_API_KEY, GOOGLE_CUSTOM_SEARCH_CX } from "./env.js";
import { HTMLElement, parse } from "node-html-parser";

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
	const document = parse(html);
	const minimized = minimizeWebsiteContents(document);
	return minimized;
};

const minimizeWebsiteContents = (document: HTMLElement): string => {
	const text = extractTextFromDocument(document);
	const minimized = text.replace(/\s+/g, " ");
	return minimized;
};

const extractTextFromDocument = (document: HTMLElement): string => {
	const scriptNodes = Array.from(document.getElementsByTagName("script"));
	for (let node of scriptNodes) {
		node.parentNode.removeChild(node);
	}

	const styleNodes = Array.from(document.getElementsByTagName("style"));
	for (let node of styleNodes) {
		node.parentNode.removeChild(node);
	}

	const text = document.innerText;
	return text;
};
