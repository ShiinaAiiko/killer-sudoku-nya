import React, { useEffect, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
	userSlice,
} from '../store'

import moment from 'moment'

import { alert, bindEvent, snackbar } from '@saki-ui/core'
// console.log(sakiui.bindEvent)
import { storage } from '../store/storage'
import { useTranslation } from 'react-i18next'
import { GetTime } from '../plugins/methods'

export interface StatisticsData {
	games: {
		played: number
		won: number
	}
	time: {
		bestTime: number
		averageTime: number
		latestTime: number
		totalTime: number
	}
}

const StatisticsComponent = ({
	visible,
	type,
	onClose,
}: {
	visible: boolean
	type: 'Sudoku' | 'KillerSudoku'
	onClose: () => void
}) => {
	const { t, i18n } = useTranslation('statistics')
	const config = useSelector((state: RootState) => state.config)
	const dispatch = useDispatch<AppDispatch>()

	const [activeTabLabel, setActiveTabLabel] = useState('Easy')

	const [statisticsData, setStatisticsData] = useState<StatisticsData>({
		games: {
			played: 0,
			won: 0,
		},
		time: {
			bestTime: 0,
			averageTime: 0,
			latestTime: 0,
			totalTime: 0,
		},
	})

	const updateStatistics = async (difficulty: any) => {
		const games = (await storage.killerSudokuData.getAll()).filter(
			(v) => v.value.difficulty === difficulty
		)
		let bestTime = 0
		let totalTime = 0
		let totalWTime = 0
		let latestTime = 0
		let wonCount = 0
		// console.log('games', await storage.killerSudokuData.getAll(), difficulty)
		games.forEach((v) => {
			// console.log(v)
			if (v.value.status === 1) {
				if (!bestTime) {
					bestTime = v.value.time
				}
				wonCount++
				v.value.time < bestTime && (bestTime = v.value.time)
				latestTime = v.value.time
				totalWTime += v.value.time
			}
      totalTime += v.value.time
		})
		setStatisticsData({
			games: {
				played: games.length,
				won: wonCount,
			},
			time: {
				bestTime,
				averageTime: totalWTime / wonCount || 0,
				latestTime: latestTime,
				totalTime: totalTime,
			},
		})
	}

	useEffect(() => {
		visible && updateStatistics(activeTabLabel)
	}, [visible])

	return (
		<saki-modal
			ref={bindEvent({
				close() {
					setActiveTabLabel('Easy')
				},
			})}
			width='100%'
			height={config.deviceType === 'Mobile' ? '100%' : 'auto'}
			max-width={config.deviceType === 'Mobile' ? '100%' : '500px'}
			max-height={config.deviceType === 'Mobile' ? '100%' : '600px'}
			mask
			border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
			border={config.deviceType === 'Mobile' ? 'none' : ''}
			mask-closable='false'
			background-color='#fff'
			visible={visible}
		>
			<div className={'statistics-component ' + config.deviceType}>
				<div className='s-header'>
					<saki-modal-header
						border
						close-icon={true}
						ref={bindEvent({
							close() {
								onClose && onClose()
							},
						})}
						title={t('statistics', {
							ns: 'statistics',
						})}
					>
						<div
							style={{
								padding: '0 10px 0 0',
							}}
							slot='right'
						>
							<saki-button
								ref={bindEvent({
									tap() {
										console.log('清理数据')

										alert({
											title: t('clearHistoricalStatistics', {
												ns: 'prompt',
											}),
											content: t('clearHistoricalStatisticsContent', {
												ns: 'prompt',
											}),
											cancelText: t('cancel', {
												ns: 'prompt',
											}),
											confirmText: t('clear', {
												ns: 'prompt',
											}),
											onCancel() {},
											onConfirm() {
												storage.killerSudokuData.deleteAll()
												setStatisticsData({
													games: {
														played: 0,
														won: 0,
													},
													time: {
														bestTime: 0,
														averageTime: 0,
														latestTime: 0,
														totalTime: 0,
													},
												})
											},
										}).open()
									},
								})}
								title='Clear'
								type='CircleIconGrayHover'
							>
								<saki-icon color='#888' type='ClearFill'></saki-icon>
							</saki-button>
						</div>
					</saki-modal-header>
				</div>
				<div className='s-main'>
					<saki-tabs
						type='Flex'
						// header-background-color='rgb(245, 245, 245)'
						header-max-width='500px'
						// header-border-bottom='none'
						header-padding='0 10px'
						header-item-min-width='80px'
						active-tab-label={activeTabLabel}
						ref={bindEvent({
							tap: (e) => {
								console.log('tap', e)
								updateStatistics(e.detail.label as any)
								setActiveTabLabel(e.detail.label)
								// setOpenDropDownMenu(false)
							},
						})}
					>
						{['Easy', 'Moderate', 'Hard', 'Extreme'].map((v) => {
							return (
								<saki-tabs-item
									key={v}
									font-size='14px'
									label={v}
									name={t(v.toLowerCase(), {
										ns: 'killerSudokuPage',
									})}
								>
									<saki-page-container full>
										<div slot='header'></div>
										<div slot='main'>
											<saki-scroll-view mode='Auto'>
												<saki-page-main align='center' full max-width='768px'>
													<div className='s-m-page'>
														<div className='s-m-p-item'>
															<saki-title
																margin='0 0 10px 0'
																level='4'
																color='default'
															>
																{t('games')}
															</saki-title>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('gamesPlayed')}
																</div>
																<div className='s-m-p-i-right'>
																	{statisticsData.games.played}
																</div>
															</div>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('gamesWon')}
																</div>
																<div className='s-m-p-i-right'>
																	{statisticsData.games.won}
																</div>
															</div>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('winRate')}
																</div>
																<div className='s-m-p-i-right'>
																	{(Math.floor(
																		(statisticsData.games.won /
																			statisticsData.games.played) *
																			100
																	) || 0) + '%'}
																</div>
															</div>
														</div>
														<div className='s-m-p-item'>
															<saki-title
																margin='0 0 10px 0'
																level='4'
																color='default'
															>
																{t('time')}
															</saki-title>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('bestTime')}
																</div>
																<div className='s-m-p-i-right'>
																	{GetTime(statisticsData.time.bestTime)}
																</div>
															</div>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('averageTime')}
																</div>
																<div className='s-m-p-i-right'>
																	{GetTime(statisticsData.time.averageTime)}
																</div>
															</div>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('latestTime')}
																</div>
																<div className='s-m-p-i-right'>
																	{GetTime(statisticsData.time.latestTime)}
																</div>
															</div>
															<div className='s-m-p-i-content'>
																<div className='s-m-p-i-left'>
																	{t('gameTime')}
																</div>
																<div className='s-m-p-i-right'>
																	{GetTime(statisticsData.time.totalTime)}
																</div>
															</div>
														</div>
													</div>
												</saki-page-main>
											</saki-scroll-view>
										</div>
									</saki-page-container>
								</saki-tabs-item>
							)
						})}
					</saki-tabs>
				</div>
			</div>
		</saki-modal>
	)
}

export default StatisticsComponent
