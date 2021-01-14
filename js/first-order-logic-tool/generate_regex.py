from re import escape, match
from urllib.request import urlopen

def get_regex_for_categories(*categories: str) -> str:
	ranges = []

	with urlopen('https://www.unicode.org/Public/UCD/latest/ucd/extracted/DerivedGeneralCategory.txt') as response:
		charset = response.info().get_content_charset('utf-8')

		for line in map(lambda line: line.decode(charset), response):
			m = match(r'[ \t]*(?P<min>[0-9A-Fa-f]+)(?:[ \t]*\.\.[ \t]*(?P<max>[0-9A-Fa-f]+))?[ \t]*;[ \t]*(?P<category>[A-Z][a-z&])', line)

			if m is None:
				continue

			min = int(m['min'], base=16)
			max = m['max']
			max = int(max, base=16) if max is not None else min
			category = m['category']

			if min > 0xFFFF:
				continue
			if max > 0xFFFF:
				max = 0xFFFF

			if not any(category == c for c in categories):
				continue

			ranges += [(min, max)]

	ranges.sort(key=lambda r: r[0])

	while True:
		done = True

		for i in range(len(ranges) - 1):
			if ranges[i][1] == ranges[i + 1][0] - 1:
				ranges[i] = (ranges[i][0], ranges[i + 1][1])
				del ranges[i + 1]
				done = False
				break

		if done:
			break

	regex = '['

	for r in ranges:
		if r[1] == r[0]:
			regex += escape(chr(r[0]))
		elif r[1] == r[0] + 1:
			regex += f'{escape(chr(r[0]))}{escape(chr(r[1]))}'
		else:
			regex += f'{escape(chr(r[0]))}-{escape(chr(r[1]))}'

	regex += ']'
	return regex

if __name__ == '__main__':
	with open('regex.txt', 'w', encoding='UTF-8') as f:
		f.write('\n'.join([
			get_regex_for_categories('Lu', 'Ll', 'Lt', 'Lm', 'Lo', 'Pc'),
			get_regex_for_categories('Lu', 'Ll', 'Lt', 'Lm', 'Lo', 'Pc', 'Nd', 'Nl', 'Mn', 'Mc')
		]))